import { Types } from 'mongoose';
import {
  BoardModel,
  IBoardDocument,
  IBoardColumn,
  IBoardSettings,
  DEFAULT_BOARD_COLUMNS,
  DEFAULT_BOARD_SETTINGS,
} from '../models/board.model';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';

export class BoardService {
  /**
   * Get user role on a project for RBAC checks
   */
  public static async getUserProjectRole(
    projectId: string,
    userId: string
  ): Promise<'Project Owner' | 'Project Admin' | 'Developer' | 'Tester' | 'Viewer'> {
    if (!userId || !Types.ObjectId.isValid(userId)) return 'Viewer';
    if (!projectId || !Types.ObjectId.isValid(projectId)) return 'Viewer';

    const project = await ProjectModel.findById(projectId);
    if (!project) return 'Viewer';

    if (project.owner.toString() === userId.toString()) {
      return 'Project Owner';
    }

    const member = await ProjectMemberModel.findOne({
      project: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
      status: 'active',
    });

    if (member) {
      return member.role;
    }

    return 'Developer'; // Default project contributor if part of org/workspace
  }

  /**
   * Get or create board for a given project
   */
  public static async getOrCreateBoard(
    projectId: string,
    userId?: string
  ): Promise<IBoardDocument> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID');
    }

    let board = await BoardModel.findOne({ project: new Types.ObjectId(projectId) });

    if (!board) {
      board = await BoardModel.create({
        project: new Types.ObjectId(projectId),
        columns: DEFAULT_BOARD_COLUMNS,
        settings: DEFAULT_BOARD_SETTINGS,
      });
    }

    return board;
  }

  /**
   * Update board columns
   */
  public static async updateColumns(
    projectId: string,
    columns: IBoardColumn[],
    userId?: string
  ): Promise<IBoardDocument> {
    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Project Admin';
    if (role === 'Viewer' || role === 'Tester') {
      throw new Error('Permission denied: You do not have permissions to modify board columns.');
    }

    const board = await BoardService.getOrCreateBoard(projectId, userId);
    board.columns = columns;
    await board.save();
    return board;
  }

  /**
   * Update board settings
   */
  public static async updateSettings(
    projectId: string,
    settings: Partial<IBoardSettings>,
    userId?: string
  ): Promise<IBoardDocument> {
    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Project Admin';
    if (role === 'Viewer') {
      throw new Error('Permission denied: You do not have permissions to modify board settings.');
    }

    const board = await BoardService.getOrCreateBoard(projectId, userId);
    board.settings = { ...board.settings, ...settings };
    await board.save();
    return board;
  }

  /**
   * Add a custom column to the board
   */
  public static async addColumn(
    projectId: string,
    colData: Partial<IBoardColumn>,
    userId?: string
  ): Promise<IBoardDocument> {
    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Project Admin';
    if (role === 'Viewer' || role === 'Tester' || role === 'Developer') {
      throw new Error('Permission denied: Only Project Managers, Owners, and Admins can create board columns.');
    }

    const board = await BoardService.getOrCreateBoard(projectId, userId);
    const id = `col-${Date.now()}`;
    const newCol: IBoardColumn = {
      id,
      name: colData.name || 'New Column',
      statusKey: colData.statusKey || 'Todo',
      color: colData.color || '#3B82F6',
      icon: colData.icon || 'Circle',
      order: board.columns.length,
      isCollapsed: false,
      isArchived: false,
      wipLimit: colData.wipLimit || 0,
    };

    board.columns.push(newCol);
    await board.save();
    return board;
  }

  /**
   * Rename or edit a column
   */
  public static async renameColumn(
    projectId: string,
    columnId: string,
    updates: Partial<IBoardColumn>,
    userId?: string
  ): Promise<IBoardDocument> {
    const board = await BoardService.getOrCreateBoard(projectId, userId);
    const col = board.columns.find((c) => c.id === columnId);
    if (!col) {
      throw new Error('Column not found');
    }

    if (updates.name) col.name = updates.name;
    if (updates.color) col.color = updates.color;
    if (updates.icon) col.icon = updates.icon;
    if (updates.statusKey) col.statusKey = updates.statusKey;
    if (updates.wipLimit !== undefined) col.wipLimit = updates.wipLimit;
    if (updates.isCollapsed !== undefined) col.isCollapsed = updates.isCollapsed;
    if (updates.isArchived !== undefined) col.isArchived = updates.isArchived;

    await board.save();
    return board;
  }

  /**
   * Delete column from board
   */
  public static async deleteColumn(
    projectId: string,
    columnId: string,
    userId?: string
  ): Promise<IBoardDocument> {
    const role = userId ? await BoardService.getUserProjectRole(projectId, userId) : 'Project Admin';
    if (role === 'Viewer' || role === 'Tester' || role === 'Developer') {
      throw new Error('Permission denied: Only Project Managers, Owners, and Admins can delete columns.');
    }

    const board = await BoardService.getOrCreateBoard(projectId, userId);
    if (board.columns.length <= 1) {
      throw new Error('Cannot delete the last remaining column on the board.');
    }

    board.columns = board.columns.filter((c) => c.id !== columnId);
    await board.save();
    return board;
  }
}
