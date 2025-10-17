import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  User, 
  Send, 
  Paperclip, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  confidence?: number;
  attachments?: string[];
}

const sampleMessages: Message[] = [
  {
    id: '1',
    type: 'agent',
    content: "Hello! I'm the OpsCrew Intake Agent. I'm here to help qualify your project requirements and generate a proposal. What kind of project are you looking to build?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    confidence: 95
  },
  {
    id: '2',
    type: 'user',
    content: "Hi! We need a modern e-commerce platform for our retail business. We're looking for something that can handle around 10,000 products and integrate with our existing inventory system.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '3',
    type: 'agent',
    content: "Great! An e-commerce platform is definitely something we can help with. To better understand your requirements, could you tell me:\n\n1. What's your target timeline for this project?\n2. What's your approximate budget range?\n3. Do you have any specific technology preferences?\n4. What's your current inventory system?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    confidence: 92
  },
  {
    id: '4',
    type: 'user',
    content: "We're hoping to launch by Q2 2024, budget is around $50-75k, we prefer React/Node.js stack, and we use SAP for inventory management.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '5',
    type: 'agent',
    content: "Perfect! Based on your requirements, I'm generating a preliminary proposal. Let me gather a few more details about your business and then I'll create a comprehensive proposal for you.",
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    confidence: 88
  }
];

export default function IntakeChat() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "Thank you for that information! I'm processing your requirements and will have a detailed proposal ready shortly. Is there anything else you'd like to discuss about the project?",
        timestamp: new Date(),
        confidence: 90
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Intake Chat</h1>
          <p className="text-muted-foreground">
            AI-powered lead qualification and proposal generation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Agent Active</span>
          </Badge>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Proposal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Intake Agent</CardTitle>
                  <CardDescription>
                    Qualifying requirements and generating proposals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[480px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {message.confidence}% confidence
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-card border border-border rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t border-border p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 input-focus"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} className="btn-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Qualification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Qualification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Project Type</span>
                <Badge variant="default">E-commerce</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Timeline</span>
                <Badge variant="secondary">Q2 2024</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Budget Range</span>
                <Badge variant="outline">$50-75k</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tech Stack</span>
                <Badge variant="outline">React/Node.js</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Generate Proposal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                Escalate to Human
              </Button>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => setInputMessage("What are your main competitors?")}
              >
                <span className="text-sm">What are your main competitors?</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => setInputMessage("Do you need mobile app support?")}
              >
                <span className="text-sm">Do you need mobile app support?</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => setInputMessage("What payment methods do you want to support?")}
              >
                <span className="text-sm">What payment methods do you want to support?</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
