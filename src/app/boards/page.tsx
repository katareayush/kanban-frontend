"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#75d22e] focus:ring-1 focus:ring-[#75d22e]"
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

const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, []);

  const token = localStorage.getItem('token');

  const fetchBoards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/boards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      'http://localhost:5000/api/boards',
      {
        title,
        columns: [
          { title: 'To Do', tasks: [] },
          { title: 'In Progress', tasks: [] },
          { title: 'Done', tasks: [] }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Token should be here, in headers
        },
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
        <div className="text-xl font-inter">Loading...</div>
      </div>
    );
  }

  return (
    
      <div className="relative z-10 container mx-auto px-8 py-8 font-mono">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold ">Your Boards</h1>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#75d22e] text-white font-mono text-lg font-bold rounded-full hover:bg-[#64b524] transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 font-inter">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
          {boards.map((board) => (
            <div
              key={board._id}
              onClick={() => router.push(`/board/${board._id}`)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 transform hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold mb-2">{board.title}</h3>
              <p className="text-gray-600 ">
                {board.columns?.length || 0} columns
              </p>
            </div>
          ))}
        </div>

        {boards.length === 0 && !loading && (
          <div className="text-center text-gray-600 mt-16">
            <p className="text-2xl">No boards yet. Create your first board to get started!</p>
          </div>
        )}

        <CreateBoardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createBoard}
        />
      </div>
    
  );
};

export default BoardsPage;