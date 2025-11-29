import Header from "@/components/Header";
import BattleArena from "@/components/BattleArena";
import HallOfFame from "@/components/HallOfFame";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <BattleArena />
        
      </main>
    </div>
  );
};

export default Index;
