"use client"
import React from 'react';

interface NavbarProps {
    className?: string;
}

const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 100);
};

export default function Navbar({ className }: NavbarProps) {

    return (
        <>
            <div className={`flex items-center h-16 text-black relative font-mono mr-12 ml-12 mt-2 font-bold text-2xl ${className || ''}`}>

                <a href='/' className="flex items-center">
                    KanBan
                </a>

                <div className="flex-grow flex justify-center space-x-8">
                    <button className="py-2 px-4 rounded-lg hover:bg-[#b9f08e] transition">Testimonials</button>
                    <a href='https://polyester-spandex-d0c.notion.site/Kanban-Technical-Documentation-16dafbf679478069856dd879b987f5b0' target='blank' className="py-2 px-4 rounded-lg hover:bg-[#b9f08e] transition">Docs</a>
                    <button onClick={scrollToContact} className="py-2 px-4 rounded-lg hover:bg-[#b9f08e] transition">Contact Us</button>
                </div>

                <div className="flex items-center ml-auto">
                    <a href="/login"> <div className="bg-[#75d22e] font-bold py-2 px-8 rounded-full text-lg hover:bg-[#64b524] transition-shadow">
                        Login
                    </div>
                    </a>
                </div>

            </div>
        </>
    )
}
