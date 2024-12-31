"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Layout, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Board {
  _id: string;
  title: string;
  columns: Array<{
    title: string;
    tasks: Array<any>;
  }>;
}

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title);
      setTitle('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center font-mono">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-4">Create New Board</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board title"
              className="w-full px-4 py-2 border-2 border-[#75d22e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75d22e] focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-8 py-3 bg-[#75d22e] text-white font-mono text-xl font-bold rounded-full hover:bg-[#64b524] transition-all"
          >
            Create Board
          </button>
        </form>
      </div>
    </div>
  );
};

const BoardCard: React.FC<{ board: Board }> = ({ board }) => {
  const router = useRouter();
  const taskCount = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);
  
  return (
    <div
      onClick={() => router.push(`/board/${board._id}`)}
      className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-gray-100 hover:border-[#75d22e] transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-[#75d22e] bg-opacity-10 rounded-lg">
          <Layout className="w-6 h-6 text-[#75d22e]" />
        </div>
        
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-gray-800">{board.title}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Columns</span>
          <span className="font-bold">{board.columns.length}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total Tasks</span>
          <span className="font-bold">{taskCount}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm font-medium text-[#75d22e]">View Board</span>
        <ArrowRight className="w-5 h-5 text-[#75d22e] transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const apiUrl = environment === 'local' 
    ? `http://localhost:5000/api/boards` 
    : process.env.NEXT_PUBLIC_BOARD_URL + "/api/boards";

  useEffect(() => {
    fetchBoards();
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchBoards = async () => {
    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch boards');
      setLoading(false);
    }
  };

  const createBoard = async (title: string) => {
    try {
      const response = await axios.post(
        apiUrl,
        {
          title,
          columns: [
            { title: 'To Do', tasks: [] },
            { title: 'In Progress', tasks: [] },
            { title: 'Done', tasks: [] }
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBoards([...boards, response.data]);
    } catch (err) {
      setError('Failed to create board');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8 font-mono">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Your Boards</h1>
            <p className="text-gray-600 mt-2">Manage and organize your tasks efficiently</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#75d22e] text-white font-mono text-lg font-bold rounded-full hover:bg-[#64b524] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <BoardCard key={board._id} board={board} />
          ))}
        </div>

        {boards.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200">
            <Layout size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-2xl text-gray-600 mb-2">No boards yet</p>
            <p className="text-gray-500 mb-6">Create your first board to get started!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#75d22e] text-white font-mono text-lg font-bold rounded-full hover:bg-[#64b524] transition-all flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Board
            </button>
          </div>
        )}

        <CreateBoardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createBoard}
        />
      </div>
    </div>
  );
};

export default BoardsPage;