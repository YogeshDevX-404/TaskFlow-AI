import { useState } from 'react';
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../types/task';
import { useBoardStore } from '../store/useBoardStore';

export const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export function useDragDrop() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const {
    tasks,
    groupedTasks,
    columns,
    moveTaskStatusOptimistic,
    reorderColumnTasksOptimistic,
    syncTaskStatusUpdate,
    syncColumnReorder,
  } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // Find task or column container
    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    // Is over a column or another card?
    let overColumnStatus: string | null = null;
    const overTaskObj = tasks.find((t) => t.id === overId);

    if (overTaskObj) {
      overColumnStatus = overTaskObj.status;
    } else {
      // Over id might be column id or statusKey
      const col = columns.find((c) => c.id === overId || c.statusKey === overId);
      if (col) {
        overColumnStatus = col.statusKey;
      }
    }

    if (!overColumnStatus) return;

    // If moving across columns during hover
    if (activeTaskObj.status !== overColumnStatus) {
      const overTasks = groupedTasks[overColumnStatus] || [];
      const overIndex = overTaskObj
        ? overTasks.findIndex((t) => t.id === overId)
        : overTasks.length;

      moveTaskStatusOptimistic(
        activeId,
        activeTaskObj.status,
        overColumnStatus,
        overIndex >= 0 ? overIndex : 0
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    let targetStatusKey: string = activeTaskObj.status;
    const overTaskObj = tasks.find((t) => t.id === overId);

    if (overTaskObj) {
      targetStatusKey = overTaskObj.status;
    } else {
      const col = columns.find((c) => c.id === overId || c.statusKey === overId);
      if (col) {
        targetStatusKey = col.statusKey;
      }
    }

    const colTasks = (groupedTasks[targetStatusKey] || []).map((t) => t.id);
    const oldIndex = colTasks.indexOf(activeId);
    let newIndex = overTaskObj ? colTasks.indexOf(overId) : colTasks.length;

    if (newIndex < 0) newIndex = 0;

    if (oldIndex !== newIndex || activeTaskObj.status !== targetStatusKey) {
      const reorderedIds = arrayMove(
        colTasks.includes(activeId) ? colTasks : [...colTasks, activeId],
        oldIndex >= 0 ? oldIndex : colTasks.length,
        newIndex
      );

      reorderColumnTasksOptimistic(targetStatusKey, reorderedIds);

      // Sync with server
      await syncTaskStatusUpdate(activeId, targetStatusKey as TaskStatus, newIndex);
      await syncColumnReorder(targetStatusKey as TaskStatus, reorderedIds);
    }
  };

  return {
    sensors,
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
