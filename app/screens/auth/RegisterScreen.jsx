import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser, parseAuthError } from '../../services/authService';
import { COLORS } from '../../constants';

const validatePassword = (pass) => {
  if (pass.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pass)) return 'Must contain at least one uppercase letter';
  if (!/[a-z]/.test(pass)) return 'Must contain at least one lowercase letter';
  if (!/[0-9]/.test(pass)) return 'Must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'Must contain at least one special character';
  return null;
};

const getStrength = (pass) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
  return score;
};

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strengthScore = getStrength(password);
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#2563EB'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }
    if (phone.length < 10) { setError('Enter a valid 10-digit phone number.'); return; }

    setError('');
    setLoading(true);
    try {
      await registerUser(name, email, password);
    } catch (err) {
      console.log('REGISTER ERROR:', err.code, err.message);
      setError(parseAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Banner */}
          <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.topBanner}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🚀</Text>
            </View>
            <Text style={styles.bannerTitle}>Create Account</Text>
            <Text style={styles.bannerSub}>Join SmartTrip and travel smarter</Text>
          </LinearGradient>

          {/* Form Card */}
          <View style={styles.card}>

            {/* Error Box */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.gray}
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
              />
            </View>

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={18} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.gray}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(t) => { setPhone(t); setError(''); }}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthBox}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: strengthScore >= i ? strengthColors[strengthScore] : '#E5E7EB' }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strengthColors[strengthScore] }]}>
                  {strengthLabels[strengthScore]}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#1D4ED8', '#3B82F6']}
                style={styles.primaryBtnGradient}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.primaryBtnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => Alert.alert('Coming Soon', 'Google Sign-In will be available in the next update.')}
            >
              <AntDesign name="google" size={20} color="#EA4335" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.switchBox}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.switchText}>
                Already have an account?{'  '}
                <Text style={styles.switchLink}>Login</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background },
  topBanner: {
    paddingTop: 50, paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  logoEmoji: { fontSize: 34 },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  bannerSub: { fontSize: 14, color: '#BFDBFE' },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20, marginTop: -24,
    borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 6, marginBottom: 32,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderWidth: 1,
    borderColor: '#FECACA', borderRadius: 10,
    padding: 12, marginBottom: 16, gap: 8,
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5,
    borderColor: COLORS.lightGray, borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 18,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.black },
  strengthBox: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: -10, marginBottom: 20, gap: 8,
  },
  strengthBars: { flexDirection: 'row', flex: 1, gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 4 },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 48 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 22 },
  primaryBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  orText: { marginHorizontal: 12, color: COLORS.gray, fontSize: 13 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.lightGray, borderRadius: 14,
    paddingVertical: 14, backgroundColor: COLORS.white, marginBottom: 28, gap: 10,
  },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  switchBox: { alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.gray },
  switchLink: { color: COLORS.primary, fontWeight: 'bold' },
});