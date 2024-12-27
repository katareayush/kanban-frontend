import BackgroundGrid from "./BackgroundGrid";

export default function Hero() {
    return (
        <BackgroundGrid>
            <div className="relative z-10 flex flex-col items-center justify-center h-[80vh] text-center font-inter font-bold">
                <h1 className="text-6xl font-bold mb-4">Empower Your <span className="italic text-transparent bg-clip-text [-webkit-text-stroke:2px_black]">Team</span><br></br> to <span className="text-[#75d22e]">Achieve</span> More.</h1>
                <p className="text-xl text-gray-600">Organize tasks, boost productivity, and collaborate seamlessly - all in one place.</p>
                <button className="mt-8 px-8 py-3 bg-[#75d22e] font-mono text-xl font-bold rounded-full hover:bg-[#64b524] transition-shadow">
                    Try It Now
                </button>
            </div>
        </BackgroundGrid>
    );
}