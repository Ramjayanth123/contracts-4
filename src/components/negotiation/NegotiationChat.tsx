
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Users } from 'lucide-react';

interface NegotiationChatProps {
  contractId: string;
}

const NegotiationChat = ({ contractId }: NegotiationChatProps) => {
  const [newMessage, setNewMessage] = useState('');

  const messages = [
    {
      id: '1',
      author: 'Sarah Johnson',
      company: 'Our Company',
      avatar: '/placeholder.svg',
      message: 'I\'ve reviewed the payment terms in section 2.1. The 45-day payment period works for us.',
      timestamp: '2 hours ago',
      isOwnMessage: true
    },
    {
      id: '2',
      author: 'John Smith',
      company: 'TechCorp',
      avatar: '/placeholder.svg',
      message: 'Great! However, we need to discuss the termination clause. Can we schedule a call tomorrow?',
      timestamp: '1 hour ago',
      isOwnMessage: false
    },
    {
      id: '3',
      author: 'Mike Chen',
      company: 'TechCorp',
      avatar: '/placeholder.svg',
      message: 'Also, regarding the scope of work - we\'d like to include 24/7 support as discussed.',
      timestamp: '45 minutes ago',
      isOwnMessage: false
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat Messages */}
      <Card className="lg:col-span-3 glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Negotiation Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-80">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback>{message.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-md ${message.isOwnMessage ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{message.author}</span>
                      <span className="text-xs text-muted-foreground">({message.company})</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card border border-white/10'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="glass-card border-white/10"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button variant="outline" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">Our Company</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Smith</p>
              <p className="text-xs text-muted-foreground">TechCorp</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Mike Chen</p>
              <p className="text-xs text-muted-foreground">TechCorp</p>
            </div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NegotiationChat;
