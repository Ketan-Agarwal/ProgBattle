
import Round2Page from "@/components/LeaderboardR2";

export default function LeaderboardPage() {
    // const [status, setStatus] = useState("Loading...");
    // useEffect(() => {
    //     const fetchR2 = async () => {
    //         try {
    //             const res = await getR2();
    //             setStatus(stringify(res));
    //         } catch (err) {
    //             console.error("Auth failed:", err);
    //         }
    //     };

    //     fetchR2();
    // }
    // , []);

    return (
        <main className="lg:ml-64 pt-20 p-6 min-h-screen">
        <h1 className="text-2xl font-bold">Leaderboard - Round 2</h1>
        <p className="">Here you can view the leaderboard. This is final round.</p>
            <Round2Page />
        </main>    );
    }