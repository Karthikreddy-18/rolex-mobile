import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Switch, Pressable,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SPEEDS = [0.25, 0.5, 0.75, 1];

function SettingCard({ title, children }) {
  return (
    <View style={styles.card}>
      <LinearGradient colors={['rgba(30,41,59,0.8)', 'rgba(30,41,59,0.4)']} style={styles.cardBg} />
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const BACKEND_URL = 'http://192.168.43.63:8000';

export default function SettingsScreen() {
  const [name, setName] = useState('You');
  const [editingName, setEditingName] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [morningRoutine, setMorningRoutine] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(0.5);
  const [wakeSensitivity, setWakeSensitivity] = useState(0.6);
  const [groqKey, setGroqKey] = useState('');
  const [backendUrl, setBackendUrl] = useState(BACKEND_URL);
  const [keySaved, setKeySaved] = useState(false);

  const saveGroqKey = async () => {
    if (!groqKey.trim()) return;
    try {
      await fetch(`${backendUrl}/api/settings/groq-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'groq_api_key', value: groqKey.trim() }),
      });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    } catch {
      setKeySaved(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0c1222', '#0f172a', '#0c1222']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerLine} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <LinearGradient colors={['#a855f7', '#06b6d4']} style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>{name[0]}</Text>
            </LinearGradient>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                onBlur={() => setEditingName(false)}
                autoFocus
              />
            ) : (
              <Pressable onPress={() => setEditingName(true)}>
                <Text style={styles.profileName}>{name}</Text>
              </Pressable>
            )}
            <Text style={styles.profileSub}>Tap name to edit</Text>
          </View>

          <SettingCard title="Profile">
            {['Name', 'Location', 'Age'].map(field => (
              <View key={field} style={styles.profileRow}>
                <Text style={styles.fieldLabel}>{field}</Text>
                <View style={styles.fieldValueWrap}>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={field === 'Name' ? name : `Enter ${field.toLowerCase()}`}
                    placeholderTextColor="#475569"
                  />
                  <Ionicons name="pencil" size={14} color="#64748b" />
                </View>
              </View>
            ))}
          </SettingCard>

          <SettingCard title="Reminders">
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Daily Reminder</Text>
                <Text style={styles.toggleSub}>Get a summary every morning</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: '#334155', true: 'rgba(168,85,247,0.4)' }}
                thumbColor={dailyReminder ? '#a855f7' : '#64748b'}
              />
            </View>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Event Reminders</Text>
                <Text style={styles.toggleSub}>Notify before scheduled events</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: '#334155', true: 'rgba(168,85,247,0.4)' }}
                thumbColor={true ? '#a855f7' : '#64748b'}
              />
            </View>
          </SettingCard>

          <SettingCard title="Routines">
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Morning Routine</Text>
                <Text style={styles.toggleSub}>Wake up → Weather → News → Music</Text>
              </View>
              <Switch
                value={morningRoutine}
                onValueChange={setMorningRoutine}
                trackColor={{ false: '#334155', true: 'rgba(168,85,247,0.4)' }}
                thumbColor={morningRoutine ? '#a855f7' : '#64748b'}
              />
            </View>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Evening Wind Down</Text>
                <Text style={styles.toggleSub}>Dim lights → Calm music → Bedtime</Text>
              </View>
              <Switch
                value={false}
                trackColor={{ false: '#334155', true: 'rgba(168,85,247,0.4)' }}
                thumbColor={false ? '#a855f7' : '#64748b'}
              />
            </View>
          </SettingCard>

          <SettingCard title="Voice Settings">
            <Text style={styles.fieldLabel}>Voice Speed</Text>
            <View style={styles.speedRow}>
              {SPEEDS.map(s => (
                <Pressable
                  key={s}
                  style={[styles.speedBtn, voiceSpeed === s && styles.speedBtnActive]}
                  onPress={() => setVoiceSpeed(s)}
                >
                  <Text style={[styles.speedText, voiceSpeed === s && styles.speedTextActive]}>
                    {s}x
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Wake Word Sensitivity</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Low</Text>
              <View style={styles.sliderTrack}>
                {[0.2, 0.4, 0.6, 0.8, 1].map(v => (
                  <Pressable
                    key={v}
                    style={[styles.sliderDot, wakeSensitivity >= v && styles.sliderDotActive]}
                    onPress={() => setWakeSensitivity(v)}
                  />
                ))}
              </View>
              <Text style={styles.sliderLabel}>High</Text>
            </View>
          </SettingCard>

          <SettingCard title="API Configuration">
            <Text style={styles.fieldLabel}>Backend URL</Text>
            <TextInput
              style={styles.apiInput}
              value={backendUrl}
              onChangeText={setBackendUrl}
              placeholder="http://192.168.43.63:8000"
              placeholderTextColor="#475569"
            />
            <View style={{ height: 12 }} />
            <Text style={styles.fieldLabel}>Groq API Key</Text>
            <View style={styles.apiRow}>
              <TextInput
                style={[styles.apiInput, { flex: 1 }]}
                value={groqKey}
                onChangeText={setGroqKey}
                placeholder="gsk_..."
                placeholderTextColor="#475569"
                secureTextEntry
              />
              <Pressable style={styles.saveKeyBtn} onPress={saveGroqKey}>
                <Text style={styles.saveKeyText}>{keySaved ? 'Saved!' : 'Save'}</Text>
              </Pressable>
            </View>
            <Text style={styles.apiHint}>Get a free key at console.groq.com</Text>
          </SettingCard>

          <SettingCard title="System">
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Background Listening</Text>
                <Text style={styles.toggleSub}>Always listen for wake word</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: '#334155', true: 'rgba(168,85,247,0.4)' }}
                thumbColor={true ? '#a855f7' : '#64748b'}
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.fieldLabel}>WiFi Address</Text>
              <Text style={styles.infoValue}>192.168.1.42</Text>
            </View>
          </SettingCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  headerTitle: {
    fontSize: 28, fontWeight: '700', color: '#f1f5f9',
    letterSpacing: 0.5,
  },
  headerLine: {
    width: 40, height: 3, borderRadius: 2,
    backgroundColor: '#a855f7', marginTop: 8,
  },
  scroll: { flex: 1, paddingHorizontal: 20 },
  profileSection: {
    alignItems: 'center', paddingVertical: 24,
  },
  profileAvatar: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  profileInitial: { color: '#fff', fontSize: 28, fontWeight: '700' },
  profileName: { color: '#f1f5f9', fontSize: 20, fontWeight: '600', marginTop: 12 },
  nameInput: {
    color: '#f1f5f9', fontSize: 20, fontWeight: '600', marginTop: 12,
    borderBottomWidth: 1, borderBottomColor: '#a855f7',
    textAlign: 'center', paddingVertical: 2,
  },
  profileSub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  card: {
    borderRadius: 16, marginBottom: 14, padding: 18,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.12)',
    overflow: 'hidden', position: 'relative',
  },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardTitle: {
    color: '#a855f7', fontSize: 13, fontWeight: '600',
    letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase',
  },
  profileRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(168,85,247,0.06)',
  },
  fieldLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  fieldValueWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  fieldInput: { color: '#f1f5f9', fontSize: 14, textAlign: 'right', minWidth: 120 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(168,85,247,0.06)',
  },
  toggleLabel: { color: '#f1f5f9', fontSize: 15, fontWeight: '500' },
  toggleSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  speedRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  speedBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
    alignItems: 'center',
  },
  speedBtnActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  speedText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  speedTextActive: { color: '#fff' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  sliderLabel: { color: '#64748b', fontSize: 12, fontWeight: '500' },
  sliderTrack: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 2, borderColor: 'rgba(168,85,247,0.3)',
  },
  sliderDotActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  infoValue: { color: '#f1f5f9', fontSize: 14, fontFamily: 'monospace' },
  apiInput: {
    color: '#f1f5f9', fontSize: 14,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
  },
  apiRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  saveKeyBtn: {
    backgroundColor: '#a855f7', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  saveKeyText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  apiHint: { color: '#64748b', fontSize: 11, marginTop: 6 },
});
