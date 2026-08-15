import { Request, Response } from 'express';
import { sendSuccessResponse } from '../utils/apiResponse';
import { HTTP_STATUS, API_MESSAGES } from '../constants';

export const createPlaceholderController = (moduleName: string) => {
  return {
    getAll: async (_req: Request, res: Response): Promise<Response> => {
      return sendSuccessResponse(res, HTTP_STATUS.OK, `${moduleName} - List endpoint ready.`, {
        module: moduleName,
        action: 'getAll',
        status: API_MESSAGES.PLACEHOLDER_ROUTE,
      });
    },

    getById: async (req: Request, res: Response): Promise<Response> => {
      const { id } = req.params;
      return sendSuccessResponse(res, HTTP_STATUS.OK, `${moduleName} - Detail endpoint ready for ID: ${id}.`, {
        module: moduleName,
        id,
        action: 'getById',
        status: API_MESSAGES.PLACEHOLDER_ROUTE,
      });
    },

    create: async (req: Request, res: Response): Promise<Response> => {
      return sendSuccessResponse(res, HTTP_STATUS.CREATED, `${moduleName} - Create endpoint ready.`, {
        module: moduleName,
        action: 'create',
        receivedData: req.body,
        status: API_MESSAGES.PLACEHOLDER_ROUTE,
      });
    },

    update: async (req: Request, res: Response): Promise<Response> => {
      const { id } = req.params;
      return sendSuccessResponse(res, HTTP_STATUS.OK, `${moduleName} - Update endpoint ready for ID: ${id}.`, {
        module: moduleName,
        id,
        action: 'update',
        receivedData: req.body,
        status: API_MESSAGES.PLACEHOLDER_ROUTE,
      });
    },

    delete: async (req: Request, res: Response): Promise<Response> => {
      const { id } = req.params;
      return sendSuccessResponse(res, HTTP_STATUS.OK, `${moduleName} - Delete endpoint ready for ID: ${id}.`, {
        module: moduleName,
        id,
        action: 'delete',
        status: API_MESSAGES.PLACEHOLDER_ROUTE,
      });
    },
  };
};
