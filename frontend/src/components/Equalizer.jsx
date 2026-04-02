export default function Equalizer() {
  return (
    <div className="flex items-end gap-[2px] h-6 w-5">
      <div className="w-[3px] bg-green-500 animate-equalizer-1 rounded-t-sm" style={{ height: '30%' }}></div>
      <div className="w-[3px] bg-green-500 animate-equalizer-2 rounded-t-sm" style={{ height: '80%' }}></div>
      <div className="w-[3px] bg-green-500 animate-equalizer-3 rounded-t-sm" style={{ height: '40%' }}></div>
      <div className="w-[3px] bg-green-500 animate-equalizer-4 rounded-t-sm" style={{ height: '60%' }}></div>
    </div>
  );
}
