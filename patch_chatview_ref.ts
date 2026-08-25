import fs from 'fs';
let content = fs.readFileSync('src/components/views/ChatView.tsx', 'utf-8');

content = content.replace("const [activeConvId, setActiveConvId] = useState<string | null>(null);", "const [activeConvId, setActiveConvId] = useState<string | null>(null);\n  const activeConvIdRef = useRef(activeConvId);\n  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);");

content = content.replace(/conversation_id: activeConvId/g, "conversation_id: activeConvIdRef.current");

fs.writeFileSync('src/components/views/ChatView.tsx', content);
console.log("Patched ref");
