import { useBoardStore } from '../store/useBoardStore';
import { BoardColumn } from '../types/board';

export function useColumns() {
  const {
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
    toggleCollapseColumn,
    reorderColumns,
  } = useBoardStore();

  return {
    columns,
    addColumn: (colData: Partial<BoardColumn>) => addColumn(colData),
    renameColumn: (columnId: string, name: string) => updateColumn(columnId, { name }),
    updateColumn: (columnId: string, updates: Partial<BoardColumn>) => updateColumn(columnId, updates),
    deleteColumn: (columnId: string) => deleteColumn(columnId),
    toggleCollapseColumn: (columnId: string) => toggleCollapseColumn(columnId),
    reorderColumns: (newColumns: BoardColumn[]) => reorderColumns(newColumns),
  };
}
