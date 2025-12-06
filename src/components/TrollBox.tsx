import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";

interface Message {
    id: number;
    user_address: string;
    content: string;
    created_at: string;
}

const Trollbox = () => {
    const { publicKey } = useWallet();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [status, setStatus] = useState<"CONNECTING" | "LIVE" | "DISCONNECTED">("CONNECTING");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Track optimistic messages to prevent duplicates
    const optimisticIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        // 1. Initial Fetch
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true }) 
                .limit(50);
            
            if (data) setMessages(data);
        };

        fetchMessages();

        // 2. Realtime Subscription
        const channelId = `room-${Date.now()}`;
        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages' 
            }, (payload) => {
                const newMsg = payload.new as Message;
                
                setMessages((prev) => {
                    // DUPLICATE CHECK LOGIC
                    // Check if we already have a message with this ID
                    if (prev.some(m => m.id === newMsg.id)) return prev;

                    // Check if we have an optimistic message with same content/user from last 2 seconds
                    // This handles the "Double Message" issue
                    const isDuplicateOptimistic = prev.some(m => 
                        m.user_address === newMsg.user_address &&
                        m.content === newMsg.content && 
                        // Only consider it a dupe if created very recently (within 5s)
                        (new Date(newMsg.created_at).getTime() - new Date(m.created_at).getTime() < 5000)
                    );

                    // If it matches an optimistic one, we ideally replace it, or just ignore the incoming if visual is fine.
                    // Better UX: Replace the temp one with the real one to get the real ID.
                    if (isDuplicateOptimistic) {
                        return prev.map(m => 
                            (m.user_address === newMsg.user_address && m.content === newMsg.content) 
                            ? newMsg 
                            : m
                        );
                    }

                    return [...prev, newMsg];
                });
            })
            .subscribe((state) => {
                if (state === 'SUBSCRIBED') setStatus("LIVE");
                else setStatus("DISCONNECTED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !publicKey) return;

        const content = newMessage.trim();
        const userAddress = publicKey.toString();
        setNewMessage(""); // Clear input

        // 3. Optimistic Update (Show immediately)
        const tempId = Date.now();
        const optimisticMsg: Message = {
            id: tempId,
            user_address: userAddress,
            content: content,
            created_at: new Date().toISOString()
        };
        
        optimisticIds.current.add(tempId);
        setMessages(prev => [...prev, optimisticMsg]);

        // 4. Send to Database
        const { error } = await supabase
            .from('messages')
            .insert([{ user_address: userAddress, content }]);

        if (error) {
            console.error("Failed to send:", error);
            // Rollback on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Failed to send message");
        }
    };

    return (
        <div className="w-full h-full min-h-[400px]">
            <Card className="bg-[#1c1917] border-2 border-[#4A3F35] p-0 shadow-stone texture-stone overflow-hidden flex flex-col h-screen">
                
                {/* Header with Status Indicator */}
                <div className="bg-[#0c0a09] border-b border-[#4A3F35] p-4 flex items-center gap-2 sticky top-0 z-10">
                    <MessageSquare className="w-5 h-5 text-[#CCA46D]" />
                    <h3 className="font-display text-lg text-[#CCA46D] uppercase tracking-widest">
                        The Forum
                    </h3>
                    <div className="ml-auto flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                            status === 'LIVE' ? 'bg-green-500 animate-pulse' : 
                            status === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-stone-500 font-mono">{status}</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#4A3F35] scrollbar-track-transparent">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-stone-600 italic">
                            Silence in the arena...
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = publicKey && msg.user_address === publicKey.toString();
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className={`text-[10px] font-mono ${isMe ? 'text-[#CCA46D]' : 'text-stone-500'}`}>
                                            {msg.user_address.slice(0, 4)}...{msg.user_address.slice(-4)}
                                        </span>
                                    </div>
                                    <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm break-words ${
                                        isMe 
                                            ? 'bg-[#CCA46D]/20 text-[#E7E5E4] border border-[#CCA46D]/30 rounded-tr-none' 
                                            : 'bg-[#292524] text-[#A8A29E] border border-[#4A3F35] rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-[#0c0a09] border-t border-[#4A3F35] flex gap-2">
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={publicKey ? "Trash talk here..." : "Connect wallet"}
                        disabled={!publicKey}
                        className="bg-[#1c1917] border-[#4A3F35] text-stone-300 focus:border-[#CCA46D] placeholder:text-stone-600 h-10"
                    />
                    <Button 
                        onClick={handleSend}
                        disabled={!publicKey || !newMessage.trim()}
                        className="bg-[#CCA46D] text-black hover:bg-[#B08D57] h-10 w-10 p-0 flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

            </Card>
        </div>
    );
};

export default Trollbox;