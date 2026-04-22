export default function AnimatedGridBackground() {
  return (
    <>
      <style>{`
        @keyframes move-bg-diagonal {
          0% { transform: rotate(45deg) scale(150%) translateX(0); }
          100% { transform: rotate(45deg) scale(150%) translateX(15%); }
        }
      `}</style>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
        <div
          className="absolute inset-0"
          style={{ animation: "move-bg-diagonal 10s linear infinite" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        </div>
      </div>
    </>
  );
}
