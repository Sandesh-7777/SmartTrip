import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser, parseAuthError } from '../../services/authService';
import { COLORS } from '../../constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
    } catch (err) {
      console.log('LOGIN ERROR:', err.code, err.message);
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
              <Text style={styles.logoEmoji}>✈️</Text>
            </View>
            <Text style={styles.bannerTitle}>Welcome Back</Text>
            <Text style={styles.bannerSub}>Sign in to continue your journey</Text>
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

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
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

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBox}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#1D4ED8', '#3B82F6']}
                style={styles.primaryBtnGradient}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.primaryBtnText}>Login</Text>
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

            {/* Register Link */}
            <TouchableOpacity
              style={styles.switchBox}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.switchText}>
                Don't have an account?{'  '}
                <Text style={styles.switchLink}>Sign Up</Text>
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
  forgotBox: { alignItems: 'flex-end', marginTop: -8, marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 22 },
  primaryBtnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
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