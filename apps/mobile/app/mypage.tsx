import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, LogOut, User } from 'lucide-react-native';
import { authClient } from '../lib/auth-client';

// API URL matching auth-client
const API_BASE_URL = Platform.select({
  web: 'http://localhost:3000',
  default: 'http://192.168.3.53:3000',
});

interface ProfileFormData {
  username: string;
  birthday: string;
  gender: string;
  hometown: string;
  currentResidence: string;
  hobbies: string;
  email: string;
}

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    birthday: '',
    gender: '',
    hometown: '',
    currentResidence: '',
    hobbies: '',
    email: '',
  });

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  // Date options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const genderOptions = [
    { label: '男性', value: 'male' },
    { label: '女性', value: 'female' },
    { label: '無回答', value: 'no_answer' },
  ];

  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      setFormData(prev => ({
        ...prev,
        birthday: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
      }));
    }
  }, [birthYear, birthMonth, birthDay]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await authClient.getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: 'include',
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            // Convert null values to empty strings to avoid React warnings
            setFormData(prev => ({
              ...prev,
              username: data.username || '',
              birthday: data.birthday || '',
              gender: data.gender || '',
              hometown: data.hometown || '',
              currentResidence: data.currentResidence || '',
              hobbies: data.hobbies || '',
              email: data.email || '',
            }));
            if (data.birthday) {
              const [y, m, d] = data.birthday.split('-');
              setBirthYear(y);
              setBirthMonth(parseInt(m).toString());
              setBirthDay(parseInt(d).toString());
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);

    if (!formData.username || !formData.birthday) {
      setError('Username and Birthday are required.');
      setSaving(false);
      return;
    }

    try {
      const token = await authClient.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => router.push('/chat') },
      ]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Skip confirmation on web due to dialog issues - just logout directly
    authClient.signOut().then(() => {
      router.replace('/welcome');
    }).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1E3A8A" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <View style={styles.iconCircle}>
                <User size={16} color="#3B82F6" />
              </View>
              <Text style={styles.title}>My Page</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleLogout();
            }} 
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <Text style={styles.cardDescription}>Tell us about yourself</Text>

          {/* Username */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              placeholder="Your Name"
              placeholderTextColor="#93C5FD"
            />
          </View>

          {/* Birthday */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Date of Birth <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateRow}>
              {/* Year Picker */}
              <View style={styles.datePickerContainer}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.pickerItem, birthYear === year.toString() && styles.pickerItemSelected]}
                      onPress={() => setBirthYear(year.toString())}
                    >
                      <Text style={[styles.pickerText, birthYear === year.toString() && styles.pickerTextSelected]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.pickerLabel}>Year</Text>
              </View>
              
              {/* Month Picker */}
              <View style={styles.datePickerContainer}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {months.map(month => (
                    <TouchableOpacity
                      key={month}
                      style={[styles.pickerItem, birthMonth === month.toString() && styles.pickerItemSelected]}
                      onPress={() => setBirthMonth(month.toString())}
                    >
                      <Text style={[styles.pickerText, birthMonth === month.toString() && styles.pickerTextSelected]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.pickerLabel}>Month</Text>
              </View>
              
              {/* Day Picker */}
              <View style={styles.datePickerContainer}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.pickerItem, birthDay === day.toString() && styles.pickerItemSelected]}
                      onPress={() => setBirthDay(day.toString())}
                    >
                      <Text style={[styles.pickerText, birthDay === day.toString() && styles.pickerTextSelected]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.pickerLabel}>Day</Text>
              </View>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {genderOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.genderButton, formData.gender === option.value && styles.genderButtonSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                >
                  <Text style={[styles.genderText, formData.gender === option.value && styles.genderTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hometown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Hometown</Text>
            <TextInput
              style={styles.input}
              value={formData.hometown}
              onChangeText={(text) => setFormData(prev => ({ ...prev, hometown: text }))}
              placeholder="Tokyo, Japan"
              placeholderTextColor="#93C5FD"
            />
          </View>

          {/* Current Residence */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Current Residence</Text>
            <TextInput
              style={styles.input}
              value={formData.currentResidence}
              onChangeText={(text) => setFormData(prev => ({ ...prev, currentResidence: text }))}
              placeholder="New York, USA"
              placeholderTextColor="#93C5FD"
            />
          </View>

          {/* Hobbies */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Hobbies</Text>
            <TextInput
              style={styles.input}
              value={formData.hobbies}
              onChangeText={(text) => setFormData(prev => ({ ...prev, hobbies: text }))}
              placeholder="Reading, Coding, etc."
              placeholderTextColor="#93C5FD"
            />
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 20,
    opacity: 0.7,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E3A8A',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  datePickerContainer: {
    flex: 1,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#3B82F6',
  },
  pickerText: {
    fontSize: 14,
    color: '#1E3A8A',
  },
  pickerTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pickerLabel: {
    textAlign: 'center',
    fontSize: 10,
    color: '#93C5FD',
    paddingVertical: 4,
    backgroundColor: '#F0F9FF',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  genderButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  genderText: {
    fontSize: 14,
    color: '#1E3A8A',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
