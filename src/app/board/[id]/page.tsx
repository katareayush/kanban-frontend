"use client";

import React, { useState, useEffect } from 'react';
import { ObjectId } from 'bson';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, X, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  isUrgent: boolean;
}

interface Column {
  _id: string;
  title: string;
  tasks: Task[];
}

interface Board {
  _id: string;
  title: string;
  columns: Column[];
}

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  columnId: string;
}

const SortableTask = ({ task, onEdit, onDelete, columnId }: {
    task: Task;
    onEdit: () => void;
    onDelete: () => void;
    columnId: string;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: task._id,
      data: {
        type: 'Task',
        task,
        columnId
      }
    });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      position: isDragging ? 'relative' as const : 'static' as const,
      zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={`bg-white p-3 rounded shadow-sm border-2 ${
            isDragging ? 'border-[#75d22e] shadow-lg' : 'border-gray-100 hover:border-[#75d22e]'
          } group relative cursor-grab active:cursor-grabbing`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-grow">
              <p className="font-mono">{task.title}</p>
              {task.description && (
                <p className="text-sm text-gray-600 font-mono mt-1">{task.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{task.status}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.isUrgent && (
                <AlertTriangle size={16} className="text-red-500" />
              )}
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    const Column = ({ column, onDeleteColumn, children }: {
        column: Column;
        onDeleteColumn: () => void;
        children: React.ReactNode;
      }) => {
        const { setNodeRef } = useDroppable({
          id: `column-${column._id}`,
          data: {
            type: 'Column',
            columnId: column._id
          }
        });
      
        return (
          <div className="flex-shrink-0 w-80 bg-white rounded-lg border-2 border-[#75d22e] p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold">{column.title}</h3>
              <button
                onClick={onDeleteColumn}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
      
            <div
              ref={setNodeRef}
              className={`space-y-2 min-h-[200px] rounded-lg ${
                column.tasks.length === 0 ? 'border-2 border-dashed border-gray-200' : ''
              }`}
            >
              <SortableContext items={column.tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
                {children}
              </SortableContext>
            </div>
          </div>
        );
      };
    

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSubmit, columnId }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [isUrgent, setIsUrgent] = useState(task?.isUrgent || false);
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.TODO);
  

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setIsUrgent(task.isUrgent);
      setStatus(task.status);
    } else {
      setTitle('');
      setDescription('');
      setIsUrgent(false);
      setStatus(TaskStatus.TODO);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, isUrgent, status });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold font-mono mb-4">
          {task ? 'Edit Task' : 'New Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#75d22e] rounded-lg font-mono"
              required
            />
          </div>
          
          <div>
            <label className="block font-mono mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#75d22e] rounded-lg font-mono"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-mono mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-4 py-2 border-2 border-[#75d22e] rounded-lg font-mono"
            >
              {Object.values(TaskStatus).map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isUrgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 text-[#75d22e] border-2 border-[#75d22e] rounded"
            />
            <label htmlFor="isUrgent" className="font-mono flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Mark as Urgent
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full px-8 py-3 bg-[#75d22e] text-white font-mono text-xl font-bold rounded-full hover:bg-[#64b524] transition-all"
          >
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

const BoardPage = () => {
  const params = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [taskModal, setTaskModal] = useState<{
    isOpen: boolean;
    task?: Task;
    columnId: string;
  }>({ isOpen: false, columnId: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchBoard = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/boards/${params.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem(`token`)}` }
      });
      setBoard(response.data);
      setError(null);
    } catch (err) {
      const error = err as Error;  // Explicitly cast err as Error
      console.error('Error details:', error.message);
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchBoard();
  }, [params.id]);
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || !board) return;

    try {
      const taskId = active.id as string;
      const overId = over.id as string;
      const newColumns = [...board.columns];
      
      let sourceColumn: Column | undefined;
      let targetColumn: Column | undefined;
      let sourceTask: Task | undefined;
      let sourceTaskIndex = -1;

      // Find source task and column
      for (const column of newColumns) {
        const taskIndex = column.tasks.findIndex(t => t._id === taskId);
        if (taskIndex !== -1) {
          sourceColumn = column;
          sourceTask = column.tasks[taskIndex];
          sourceTaskIndex = taskIndex;
          break;
        }
      }

      // Find target column
      const targetColumnId = overId.replace('column-', '');
      targetColumn = newColumns.find(col => col._id === targetColumnId);

      if (!sourceColumn || !targetColumn || !sourceTask) return;

      // Remove task from source column
      sourceColumn.tasks.splice(sourceTaskIndex, 1);

      // Add task to target column
      const updatedTask: Task = {
        ...sourceTask,
        status: targetColumn.title as TaskStatus
      };
      targetColumn.tasks.push(updatedTask);

      setBoard({ ...board, columns: newColumns });

      await axios.put(
        `http://localhost:5000/api/boards/${params.id}`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (err) {
      console.error('Error updating task position:', err);
      setError('Failed to update task position');
      fetchBoard();
    }
  };

  const addColumn = async (title: string) => {
    if (!board) return;

    try {
      const newColumn: Column = {
        _id: new ObjectId().toString(),
        title,
        tasks: []
      };

      const newColumns = [...board.columns, newColumn];
      
      const response = await axios.put(
        `http://localhost:5000/api/boards/${params.id}`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setBoard(response.data);
      setShowColumnModal(false);
    } catch (err) {
      console.error('Error adding column:', err);
      setError('Failed to add column');
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (!board) return;

    if (!window.confirm('Are you sure you want to delete this column and all its tasks?')) {
      return;
    }

    try {
      const newColumns = board.columns.filter(col => col._id !== columnId);
      
      const response = await axios.put(
        `http://localhost:5000/api/boards/${params.id}`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setBoard(response.data);
    } catch (err) {
      console.error('Error deleting column:', err);
      setError('Failed to delete column');
    }
  };

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (!board) return;

    try {
      // Find the correct column based on the task status
      const targetColumnId = board.columns.find(col => 
        col.title === taskData.status
      )?._id;

      if (!targetColumnId) {
        throw new Error('Invalid status selected');
      }

      const newColumns = board.columns.map(col => {
        // If editing existing task, remove it from its current column
        if (taskModal.task) {
          col.tasks = col.tasks.filter(t => t._id !== taskModal.task?._id);
        }

        // Add task to the column matching its status
        if (col._id === targetColumnId) {
          const newTask = taskModal.task ? {
            ...taskModal.task,
            title: taskData.title || taskModal.task.title,
            description: taskData.description,
            status: taskData.status || taskModal.task.status,
            isUrgent: taskData.isUrgent ?? taskModal.task.isUrgent
          } : {
            _id: new ObjectId().toString(),
            title: taskData.title || 'New Task',
            description: taskData.description,
            status: taskData.status || TaskStatus.TODO,
            createdAt: new Date(),
            isUrgent: taskData.isUrgent || false
          };

          return {
            ...col,
            tasks: [...col.tasks, newTask]
          };
        }
        return col;
      });

      const response = await axios.put(
        `http://localhost:5000/api/boards/${params.id}`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    
      setBoard(response.data);
      setError(null);
    } catch (err) {
      console.error('Error in task submission:', err);
      setError('Failed to process task. Please try again.');
      fetchBoard();
    }
  };  

  const deleteTask = async (columnId: string, taskId: string) => {
    if (!board) return;

    try {
      const newColumns = board.columns.map(col => {
        if (col._id === columnId) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t._id !== taskId)
          };
        }
        return col;
      });

      const response = await axios.put(
        `http://localhost:5000/api/boards/${params.id}`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setBoard(response.data);
      setError(null);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to delete task');
      fetchBoard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-mono">Loading...</div>
      </div>
    );
  }

  if (!board) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-mono">{board?.title}</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setTaskModal({ isOpen: true, columnId: board?.columns[0]?._id || '' })}
                className="p-2 px-4 text-white bg-[#75d22e] rounded-full hover:bg-[#64b524] transition-all font-mono flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Task
              </button>
              <button
                onClick={() => setShowColumnModal(true)}
                className="p-2 px-4 text-[#75d22e] border-2 border-[#75d22e] rounded-full hover:bg-[#75d22e] hover:text-white transition-all font-mono flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Column
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 max-w-[calc(100vw-3rem)]">
            {board?.columns.map((column) => (
              <div
                key={column._id}
                className="flex-shrink-0 w-80 bg-white rounded-lg border-2 border-[#75d22e] p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono font-bold">{column.title}</h3>
                  <button
                    onClick={() => deleteColumn(column._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div
                  id={`column-${column._id}`}
                  className={`space-y-2 min-h-[200px] rounded-lg ${
                    column.tasks.length === 0 ? 'border-2 border-dashed border-gray-200' : ''
                  }`}
                >
                  {column.tasks.map((task) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      columnId={column._id}
                      onEdit={() => setTaskModal({ isOpen: true, task, columnId: column._id })}
                      onDelete={() => deleteTask(column._id, task._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column Modal */}
        {showColumnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold font-mono mb-4">Add New Column</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = (e.target as HTMLFormElement).columnTitle.value;
                  addColumn(title);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-mono mb-1">Column Title</label>
                  <input
                    name="columnTitle"
                    type="text"
                    required
                    className="w-full px-4 py-2 border-2 border-[#75d22e] rounded-lg font-mono"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#75d22e] text-white font-mono rounded-lg hover:bg-[#64b524]"
                  >
                    Add Column
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColumnModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 font-mono rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {taskModal.isOpen && (
          <TaskModal
            isOpen={taskModal.isOpen}
            task={taskModal.task}
            columnId={taskModal.columnId}
            onClose={() => setTaskModal({ isOpen: false, columnId: '' })}
            onSubmit={handleTaskSubmit}
          />
        )}
      </div>
    </DndContext>
  );
};

export default BoardPage;