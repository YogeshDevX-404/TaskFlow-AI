import { Types } from 'mongoose';
import { Organization, IOrganizationPayload } from '../models/organization.model';
import { OrganizationMember } from '../models/organizationMember.model';
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  generateSlug,
} from '../validators/organization.validator';

export class OrganizationService {
  /**
   * Safe helper to cast string ID to Mongoose ObjectId
   */
  private static toObjectId(id: string): Types.ObjectId {
    if (Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    // Fallback if id is non-standard
    return new Types.ObjectId(id.padStart(24, '0').slice(-24));
  }

  /**
   * Helper to ensure unique slug generation
   */
  private static async getUniqueSlug(baseSlug: string, currentOrgId?: string): Promise<string> {
    let slug = baseSlug || 'org';
    let count = 0;
    let exists = true;

    while (exists) {
      const candidateSlug = count === 0 ? slug : `${slug}-${count}`;
      const query: Record<string, any> = { slug: candidateSlug };
      if (currentOrgId) {
        query._id = { $ne: this.toObjectId(currentOrgId) };
      }

      const existingOrg = await Organization.findOne(query);
      if (!existingOrg) {
        return candidateSlug;
      }
      count++;
    }

    return slug;
  }

  /**
   * Create a new organization
   */
  public static async createOrganization(
    userId: string,
    data: CreateOrganizationInput
  ): Promise<IOrganizationPayload> {
    const rawSlug = data.slug || generateSlug(data.name);
    const finalSlug = await this.getUniqueSlug(rawSlug);

    const organization = new Organization({
      name: data.name,
      slug: finalSlug,
      logo: data.logo || '',
      description: data.description || '',
      website: data.website || '',
      industry: data.industry || '',
      companySize: data.companySize || '',
      timezone: data.timezone || 'UTC',
      country: data.country || '',
      owner: this.toObjectId(userId),
      status: 'active',
      isArchived: false,
    });

    await organization.save();

    // Auto-create owner member record
    const ownerMember = new OrganizationMember({
      organization: organization._id,
      user: this.toObjectId(userId),
      role: 'owner',
      joinedAt: new Date(),
      status: 'active',
    });
    await ownerMember.save();

    return organization.toOrganizationPayload();
  }

  /**
   * Get user's organizations with search, filter, and pagination
   */
  public static async getMyOrganizations(
    userId: string,
    options: {
      search?: string;
      status?: string;
      isArchived?: boolean | string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    organizations: IOrganizationPayload[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const userObjId = this.toObjectId(userId);

    // Find all organization IDs where user is owner or active member
    const memberDocs = await OrganizationMember.find({
      user: userObjId,
      status: 'active',
    }).select('organization');

    const memberOrgIds = memberDocs.map((m) => m.organization);

    const filter: Record<string, any> = {
      $or: [{ owner: userObjId }, { _id: { $in: memberOrgIds } }],
    };

    // Search query
    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      filter.$and = [
        {
          $or: [{ owner: userObjId }, { _id: { $in: memberOrgIds } }],
        },
        {
          $or: [
            { name: searchRegex },
            { slug: searchRegex },
            { description: searchRegex },
            { industry: searchRegex },
            { country: searchRegex },
          ],
        },
      ];
      delete filter.$or;
    }

    // Status filter
    if (options.status && options.status !== 'all') {
      filter.status = options.status;
    }

    // IsArchived filter
    if (options.isArchived !== undefined && options.isArchived !== 'all') {
      if (typeof options.isArchived === 'boolean') {
        filter.isArchived = options.isArchived;
      } else if (options.isArchived === 'true') {
        filter.isArchived = true;
      } else if (options.isArchived === 'false') {
        filter.isArchived = false;
      }
    }

    // Sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [docs, total] = await Promise.all([
      Organization.find(filter as any).sort(sortOptions).skip(skip).limit(limit),
      Organization.countDocuments(filter as any),
    ]);

    const organizations = docs.map((doc) => doc.toOrganizationPayload());
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      organizations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get organization by ID or Slug
   */
  public static async getOrganizationByIdOrSlug(
    idOrSlug: string,
    userId: string
  ): Promise<IOrganizationPayload> {
    const isObjectId = Types.ObjectId.isValid(idOrSlug);
    const userObjId = this.toObjectId(userId);

    const memberDocs = await OrganizationMember.find({
      user: userObjId,
      status: 'active',
    }).select('organization');

    const memberOrgIds = memberDocs.map((m) => m.organization);

    const query: Record<string, any> = isObjectId
      ? {
          _id: this.toObjectId(idOrSlug),
          $or: [{ owner: userObjId }, { _id: { $in: memberOrgIds } }],
        }
      : {
          slug: idOrSlug.toLowerCase(),
          $or: [{ owner: userObjId }, { _id: { $in: memberOrgIds } }],
        };

    const organization = await Organization.findOne(query as any);
    if (!organization) {
      throw new Error('Organization not found or access denied.');
    }

    return organization.toOrganizationPayload();
  }

  /**
   * Update organization details
   */
  public static async updateOrganization(
    id: string,
    userId: string,
    data: UpdateOrganizationInput
  ): Promise<IOrganizationPayload> {
    const userObjId = this.toObjectId(userId);
    const organization = await Organization.findOne({
      _id: this.toObjectId(id),
      owner: userObjId,
    } as any);

    if (!organization) {
      throw new Error('Organization not found or permissions insufficient to update.');
    }

    // If slug is being updated
    if (data.slug && data.slug !== organization.slug) {
      organization.slug = await this.getUniqueSlug(data.slug, id);
    }

    if (data.name !== undefined) organization.name = data.name;
    if (data.logo !== undefined) organization.logo = data.logo;
    if (data.description !== undefined) organization.description = data.description;
    if (data.website !== undefined) organization.website = data.website;
    if (data.industry !== undefined) organization.industry = data.industry;
    if (data.companySize !== undefined) organization.companySize = data.companySize;
    if (data.timezone !== undefined) organization.timezone = data.timezone;
    if (data.country !== undefined) organization.country = data.country;
    if (data.status !== undefined) organization.status = data.status;
    if (data.isArchived !== undefined) {
      organization.isArchived = data.isArchived;
      if (data.isArchived && organization.status !== 'archived') {
        organization.status = 'archived';
      } else if (!data.isArchived && organization.status === 'archived') {
        organization.status = 'active';
      }
    }

    await organization.save();
    return organization.toOrganizationPayload();
  }

  /**
   * Archive organization
   */
  public static async archiveOrganization(id: string, userId: string): Promise<IOrganizationPayload> {
    const userObjId = this.toObjectId(userId);
    const organization = await Organization.findOne({
      _id: this.toObjectId(id),
      owner: userObjId,
    } as any);

    if (!organization) {
      throw new Error('Organization not found or permission denied.');
    }

    organization.isArchived = true;
    organization.status = 'archived';
    await organization.save();

    return organization.toOrganizationPayload();
  }

  /**
   * Restore archived organization
   */
  public static async restoreOrganization(id: string, userId: string): Promise<IOrganizationPayload> {
    const userObjId = this.toObjectId(userId);
    const organization = await Organization.findOne({
      _id: this.toObjectId(id),
      owner: userObjId,
    } as any);

    if (!organization) {
      throw new Error('Organization not found or permission denied.');
    }

    organization.isArchived = false;
    organization.status = 'active';
    await organization.save();

    return organization.toOrganizationPayload();
  }

  /**
   * Delete organization permanently
   */
  public static async deleteOrganization(id: string, userId: string): Promise<void> {
    const organization = await Organization.findOne({ _id: this.toObjectId(id) } as any);
    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Security requirement: Only owner can delete organization
    if (organization.owner.toString() !== userId) {
      throw new Error('Only the organization owner can permanently delete this organization.');
    }

    await Organization.deleteOne({ _id: this.toObjectId(id) } as any);
  }
}
