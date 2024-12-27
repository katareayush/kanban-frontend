import React from 'react';

interface NavbarProps{
    className?: string;
}

export default function Navbar({className}: NavbarProps) {

    return (
        <>
            <div className={`flex items-center h-16 text-black relative font-mono mr-12 ml-12 mt-2 font-bold text-2xl ${className || ''}`}>
                
                <div className="flex items-center">
                    KanBan
                </div>

                <div className="flex-grow flex justify-center space-x-8">
                    <button className="py-2 px-4 rounded-lg hover:bg-gray-100 transition">Docs</button>
                    <button className="py-2 px-4 rounded-lg hover:bg-gray-100 transition">Testimonials</button>
                    <button className="py-2 px-4 rounded-lg hover:bg-gray-100 transition">Contact Us</button>
                </div>

                <div className="flex items-center ml-auto">
                    <button className="bg-[#75d22e] font-bold py-2 px-8 rounded-full text-lg hover:bg-[#64b524] transition-shadow">
                        Login
                    </button>
                </div>

            </div>
        </>
    )
}
