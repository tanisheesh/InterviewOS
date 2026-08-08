export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-[#1A1A1A] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
      <span className="text-[0.65rem] font-bold tracking-widest uppercase text-[#333]">
        © {year} InterviewOS
      </span>
      <span className="text-[0.65rem] text-[#333]">
        Made with{" "}
        <span className="text-red-500" aria-label="love">♥</span>{" "}
        by{" "}
        <a
          href="https://tanisheesh.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#555] hover:text-brand-500 transition-colors font-bold"
        >
          Tanish Poddar
        </a>
      </span>
    </footer>
  );
}
