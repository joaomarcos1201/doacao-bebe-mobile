import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Estrutura de uma conversa:
// { id, name, lastMessage, time, unread, avatar }

// Estrutura de uma mensagem:
// { id, text, senderId, timestamp, status }

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Maria Silva', lastMessage: 'Ainda está disponível?', time: '10:32', unread: 2 },
  { id: '2', name: 'João Pereira', lastMessage: 'Obrigado pela doação!', time: '09:15', unread: 0 },
  { id: '3', name: 'Ana Costa', lastMessage: 'Posso retirar amanhã?', time: 'Ontem', unread: 1 },
];

const MOCK_MESSAGES = {
  '1': [
    { id: '1', text: 'Olá! Vi seu anúncio do berço.', senderId: 'other', timestamp: '10:28' },
    { id: '2', text: 'Oi! Sim, ainda está disponível.', senderId: 'me', timestamp: '10:29' },
    { id: '3', text: 'Ainda está disponível?', senderId: 'other', timestamp: '10:32' },
  ],
  '2': [
    { id: '1', text: 'Obrigado pela doação!', senderId: 'other', timestamp: '09:15' },
  ],
  '3': [
    { id: '1', text: 'Posso retirar amanhã?', senderId: 'other', timestamp: 'Ontem' },
  ],
};

function ConversationList({ conversations, onSelect }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <FlatList
      data={conversations}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.convItem} onPress={() => onSelect(item)} activeOpacity={0.7}>
          <View style={s.convAvatar}>
            <Text style={s.convAvatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={s.convInfo}>
            <View style={s.convRow}>
              <Text style={s.convName}>{item.name}</Text>
              <Text style={s.convTime}>{item.time}</Text>
            </View>
            <View style={s.convRow}>
              <Text style={s.convLastMsg} numberOfLines={1}>{item.lastMessage}</Text>
              {item.unread > 0 && (
                <View style={s.unreadBadge}>
                  <Text style={s.unreadText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={s.separator} />}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={s.emptyText}>Nenhuma conversa ainda.</Text>
        </View>
      }
    />
  );
}

function ChatWindow({ conversation, messages, onBack, onSend }) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const flatListRef = useRef(null);
  const s = styles(theme);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header da conversa */}
      <View style={s.chatHeader}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <View style={s.chatHeaderInfo}>
          <View style={s.chatAvatar}>
            <Text style={s.chatAvatarText}>{conversation.name.charAt(0)}</Text>
          </View>
          <Text style={s.chatHeaderName}>{conversation.name}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={s.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.senderId === 'me';
          return (
            <View style={[s.messageBubbleWrap, isMe ? s.bubbleWrapMe : s.bubbleWrapOther]}>
              <View style={[s.messageBubble, isMe ? s.bubbleMe : s.bubbleOther]}>
                <Text style={[s.messageText, isMe ? s.messageTextMe : s.messageTextOther]}>
                  {item.text}
                </Text>
                <Text style={[s.messageTime, isMe ? s.messageTimeMe : s.messageTimeOther]}>
                  {item.timestamp}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.messageInput}
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={theme.textMuted}
          multiline
        />
        <TouchableOpacity
          style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]}
          onPress={handleSend}
          activeOpacity={0.8}
          disabled={!text.trim()}
        >
          <Text style={s.sendBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen({ user, onBack }) {
  const { theme, toggleTheme } = useTheme();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeConversation, setActiveConversation] = useState(null);
  const s = styles(theme);

  // TODO: substituir por chamada à API
  // useEffect(() => { fetchConversations(user.id).then(setConversations); }, []);

  const handleSelectConversation = (conv) => {
    // Marca como lida
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)
    );
    setActiveConversation(conv);
  };

  const handleSend = (text) => {
    // TODO: substituir por chamada à API
    // sendMessage({ conversationId: activeConversation.id, text, senderId: user.id })
    const newMessage = {
      id: Date.now().toString(),
      text,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMessage],
    }));
    setConversations(prev =>
      prev.map(c => c.id === activeConversation.id ? { ...c, lastMessage: text, time: newMessage.timestamp } : c)
    );
  };

  if (!user) {
    return (
      <View style={s.authWall}>
        <Text style={s.authWallIcon}>💬</Text>
        <Text style={s.authWallTitle}>Faça login para acessar o chat</Text>
        <Text style={s.authWallSubtitle}>Você precisa estar logado para conversar com anunciantes.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          messages={messages[activeConversation.id] || []}
          onBack={() => setActiveConversation(null)}
          onSend={handleSend}
        />
      ) : (
        <>
          <View style={s.header}>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={s.headerBack}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Chat</Text>
            <TouchableOpacity onPress={toggleTheme} style={s.themeBtn} activeOpacity={0.7}>
              <Text style={s.themeBtnText}>{theme.isDark ? 'Modo Claro' : 'Modo Escuro'}</Text>
            </TouchableOpacity>
          </View>
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConversation}
          />
        </>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },

  // Lista de conversas
  header: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.border,
    backgroundColor: theme.bg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  headerBack: { color: theme.pink, fontSize: 14, fontWeight: '600' },
  themeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.pinkLight, borderWidth: 1, borderColor: theme.border },
  themeBtnText: { color: theme.pink, fontSize: 12, fontWeight: '600' },
  convItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  convAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  convAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  convInfo: { flex: 1 },
  convRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 15, fontWeight: '700', color: theme.text },
  convTime: { fontSize: 11, color: theme.textMuted },
  convLastMsg: { fontSize: 13, color: theme.textMuted, flex: 1, marginRight: 8 },
  unreadBadge: {
    backgroundColor: theme.pink, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  separator: { height: 1, backgroundColor: theme.border, marginLeft: 76 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: theme.textMuted, fontSize: 14 },

  // Chat window
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600', width: 60 },
  chatHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.pink, alignItems: 'center', justifyContent: 'center',
  },
  chatAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  chatHeaderName: { fontSize: 15, fontWeight: '700', color: theme.text },

  // Mensagens
  messagesList: { padding: 16, gap: 8 },
  messageBubbleWrap: { flexDirection: 'row', marginBottom: 6 },
  bubbleWrapMe: { justifyContent: 'flex-end' },
  bubbleWrapOther: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '75%', borderRadius: 16, padding: 10 },
  bubbleMe: { backgroundColor: theme.pink, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
  messageText: { fontSize: 14, lineHeight: 20 },
  messageTextMe: { color: '#fff' },
  messageTextOther: { color: theme.text },
  messageTime: { fontSize: 10, marginTop: 4 },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  messageTimeOther: { color: theme.textMuted },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 12, borderTopWidth: 1, borderTopColor: theme.border,
    backgroundColor: theme.bg,
  },
  messageInput: {
    flex: 1, backgroundColor: theme.card,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: theme.border,
    fontSize: 14, color: theme.text, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: theme.pink, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Auth wall
  authWall: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 12, backgroundColor: theme.bg,
  },
  authWallIcon: { fontSize: 48 },
  authWallTitle: { fontSize: 18, fontWeight: '700', color: theme.text, textAlign: 'center' },
  authWallSubtitle: { fontSize: 13, color: theme.textMuted, textAlign: 'center', lineHeight: 20 },
});
