"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, X, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Task {
  _id?: string; // Made required since it's used in SortableTask
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  createdAt?: Date;
  isUrgent?: boolean;
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
    transition
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow-sm border-2 border-gray-100 hover:border-[#75d22e] group relative"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono">{task.title}</p>
          {task.description && (
            <p className="text-sm text-gray-600 font-mono mt-1">{task.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{task.status}</p>
        </div>
        {task.isUrgent && (
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
        )}
      </div>
      <div className="absolute right-2 top-2 hidden group-hover:flex gap-2">
        <button
          onClick={onEdit}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-gray-100 rounded text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSubmit, columnId }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [isUrgent, setIsUrgent] = useState(task?.isUrgent || false);
  const [status, setStatus] = useState<'To Do' | 'In Progress' | 'Done'>(task?.status || 'To Do');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setIsUrgent(task.isUrgent || false);
      setStatus(task.status);
    } else {
      setTitle('');
      setDescription('');
      setIsUrgent(false);
      setStatus('To Do');
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
              onChange={(e) => setStatus(e.target.value as 'To Do' | 'In Progress' | 'Done')}
              className="w-full px-4 py-2 border-2 border-[#75d22e] rounded-lg font-mono"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
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
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/boards/${params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBoard(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load board');
        setLoading(false);
      }
    };

    fetchBoard();
  }, [params.id]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || !board) return;

    const taskId = active.id as string;
    let sourceColumnId: string | null = null;
    let sourceTaskIndex: number = -1;
    let destinationColumnId: string | null = null;
    let destinationTaskIndex: number = -1;

    board.columns.forEach((column) => {
      const taskIndex = column.tasks.findIndex((task) => task._id === taskId);
      if (taskIndex !== -1) {
        sourceColumnId = column._id;
        sourceTaskIndex = taskIndex;
      }
      if (column.tasks.findIndex((task) => task._id === over.id) !== -1) {
        destinationColumnId = column._id;
        destinationTaskIndex = column.tasks.findIndex((task) => task._id === over.id);
      }
    });

    if (!sourceColumnId || sourceTaskIndex === -1 || !destinationColumnId || destinationTaskIndex === -1) return;

    const newColumns = [...board.columns];
    const sourceColumn = newColumns.find((col) => col._id === sourceColumnId);
    const destColumn = newColumns.find((col) => col._id === destinationColumnId);

    if (!sourceColumn || !destColumn) return;

    const [movedTask] = sourceColumn.tasks.splice(sourceTaskIndex, 1);
    destColumn.tasks.splice(destinationTaskIndex, 0, movedTask);

    setBoard({ ...board, columns: newColumns });

    try {
      await axios.put(`http://localhost:5000/api/boards/${params.id}`, {
        columns: newColumns
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to update task position');
    }
  };

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (!board) return;

    try {
      const newColumns = board.columns.map(col => {
        if (col._id === taskModal.columnId) {
          if (taskModal.task) {
            // Editing existing task
            return {
              ...col,
              tasks: col.tasks.map(t => 
                t._id === taskModal.task?._id ? {
                  ...t,
                  title: taskData.title,
                  description: taskData.description,
                  status: taskData.status,
                  isUrgent: taskData.isUrgent
                } : t
              )
            };
          } else {
            // Creating new task
            const newTask: Task = {
              _id: Math.random().toString(36).substr(2, 9), // Temporary ID until backend saves
              title: taskData.title || '',
              description: taskData.description || '',
              status: taskData.status || 'To Do',
              createdAt: new Date(),
              isUrgent: taskData.isUrgent || false
            };
            
            return {
              ...col,
              tasks: [...col.tasks, newTask]
            };
          }
        }
        return col;
      });

      const response = await axios.put(
        `http://localhost:5000/api/boards/${params.id}`,
        { columns: newColumns },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setBoard(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Error details:', err.response?.data || 'No error response data');
        setError(err.response?.data?.message || 'Failed to save task');
      } else if (err instanceof Error) {
        console.error('Unexpected error:', err.message);
        setError(err.message);
      } else {
        console.error('An unknown error occurred.');
        setError('Failed to save task');
      }
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
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to delete task');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-xl font-mono">Loading...</div></div>;
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
            <h1 className="text-3xl font-bold font-mono">{board.title}</h1>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 font-mono">{error}</p>
            </div>
          )}

          <div className="flex gap-6 overflow-x-auto pb-4">
            {board.columns.map((column) => (
              <div
                key={column._id}
                className="flex-shrink-0 w-80 bg-white rounded-lg border-2 border-[#75d22e] p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono font-bold">{column.title}</h3>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <SortableContext
                  items={column.tasks.map(task => task._id)}
                  strategy={verticalListSortingStrategy}
                  >
                  <div className="space-y-2">
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
                </SortableContext>

                <button
                  onClick={() => setTaskModal({ isOpen: true, columnId: column._id })}
                  className="mt-3 w-full p-2 text-[#75d22e] border-2 border-dashed border-[#75d22e] rounded hover:bg-[#75d22e] hover:text-white transition-all font-mono flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Task
                </button>
              </div>
            ))}
          </div>
        </div>

        <TaskModal
          isOpen={taskModal.isOpen}
          task={taskModal.task}
          columnId={taskModal.columnId}
          onClose={() => setTaskModal({ isOpen: false, columnId: '' })}
          onSubmit={handleTaskSubmit}
        />
      </div>
    </DndContext>
  );
};

export default BoardPage;