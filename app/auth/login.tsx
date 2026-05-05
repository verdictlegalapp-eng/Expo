import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PRACTICE_AREAS } from '../../constants/Legal';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';
import PrivacyConsent from '../../components/PrivacyConsent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const USA_DATA: Record<string, string[]> = {
  "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa"],
  "Alaska": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan"],
  "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"],
  "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"],
  "California": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento"],
  "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood"],
  "Connecticut": ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury"],
  "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
  "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg"],
  "Georgia": ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah"],
  "Hawaii": ["Honolulu", "East Honolulu", "Pearl City", "Hilo", "Kailua"],
  "Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Caldwell"],
  "Illinois": ["Chicago", "Aurora", "Joliet", "Naperville", "Rockford"],
  "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel"],
  "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
  "Kansas": ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka"],
  "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"],
  "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Metairie", "Lafayette"],
  "Maine": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"],
  "Maryland": ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Waldorf"],
  "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell"],
  "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"],
  "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington"],
  "Mississippi": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"],
  "Missouri": ["Kansas City", "St. Louis", "Springfield", "Independence", "Columbia"],
  "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"],
  "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
  "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"],
  "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Dover"],
  "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison"],
  "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"],
  "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"],
  "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"],
  "Oregon": ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro"],
  "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
  "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence"],
  "South Carolina": ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"],
  "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
  "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso"],
  "Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem"],
  "Vermont": ["Burlington", "South Burlington", "Rutland", "Barre", "Montpelier"],
  "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News"],
  "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"],
  "West Virginia": ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"],
  "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
  "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"]
};

const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function Login() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const { userRole, setRole } = useUser();
  const isAttorney = userRole === 'attorney';
  const [showConsent, setShowConsent] = useState(false);
  
  React.useEffect(() => {
    if (role && role !== userRole) {
      setRole(role as 'client' | 'attorney');
    }
  }, [role, userRole]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    specialization: '',
    legalNeed: '',
    barId: ''
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);

  const slides = [
    { key: 'name', label: 'FULL NAME', title: 'What is your full name?' },
    { key: 'email', label: 'EMAIL ADDRESS', title: 'How can we reach you?' },
    { key: 'phone', label: 'MOBILE NUMBER', title: 'What is your mobile number?' },
    { key: 'location', label: 'LOCATION', title: 'Where are you based?' },
    ...(isAttorney ? [
      { key: 'specialization', label: 'PRACTICE AREA', title: 'What is your practice area?' },
      { key: 'barId', label: 'LICENSE ID', title: 'Verify your credentials' }
    ] : [
      { key: 'legalNeed', label: 'CURRENT LEGAL NEED', title: 'What do you need help with?' }
    ])
  ];

  const formatPhoneNumber = (text: string) => text.replace(/\D/g, '');

  const validate = () => {
    const slide = slides[currentSlide];
    let error = '';
    const val = (formData as any)[slide.key];

    if (slide.key === 'location') {
      if (!formData.state) error = 'State required';
      else if (!formData.city) error = 'City required';
    } else {
      if (!val.trim()) error = 'This field is required';
      else if (slide.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = 'Invalid email';
      else if (slide.key === 'phone' && formatPhoneNumber(val).length < 10) error = 'Invalid phone number';
      else if (slide.key === 'name' && val.length < 3) error = 'Min 3 chars';
    }

    setErrors({ [slide.key]: error });
    return !error;
  };

  const goToOtp = () => {
    const resolvedRole = typeof role === 'string' && role.length ? role : userRole;
    router.push({
      pathname: '/auth/otp',
      params: { ...formData, role: resolvedRole },
    });
  };

  const onNext = async () => {
    if (!validate()) return;
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setFocusedField(null);
      Keyboard.dismiss();
      return;
    }
    setShowConsent(true);
  };

  const handleAgree = async () => {
    setShowConsent(false);
    await startAuth();
  };

  const startAuth = async () => {
    setIsSendingSms(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      const { requestEmailOtp } = require('../../lib/authApi');
      await requestEmailOtp(cleanEmail);
      router.push({
        pathname: '/auth/otp',
        params: { ...formData, email: cleanEmail, role: typeof role === 'string' && role.length ? role : userRole },
      });
    } catch (e: unknown) {

      const message = e instanceof Error ? e.message : 'Could not send verification email';
      Alert.alert('Verification', message);
    } finally {
      setIsSendingSms(false);
    }
  };

  const onBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setErrors({});
    } else {
      router.back();
    }
  };

  const [pickerModal, setPickerModal] = useState<{ 
    visible: boolean; 
    type: 'state' | 'city' | 'specialization' | 'country'; 
    data: any[] 
  }>({ visible: false, type: 'state', data: [] });
  const [searchQuery, setSearchQuery] = useState('');

  const openPicker = (type: 'state' | 'city' | 'specialization' | 'country') => {
    let data: any[] = [];
    if (type === 'state') data = Object.keys(USA_DATA).sort();
    else if (type === 'city') data = formData.state ? USA_DATA[formData.state].sort() : [];
    else if (type === 'specialization') data = PRACTICE_AREAS;
    else if (type === 'country') data = COUNTRY_CODES;
    setPickerModal({ visible: true, type, data });
    setSearchQuery('');
  };

  const selectFromPicker = (item: any) => {
    if (pickerModal.type === 'country') {
      setCountryCode(item.code);
      setPickerModal({ ...pickerModal, visible: false });
      return;
    }
    const itemName = typeof item === 'string' ? item : item.name;
    if (pickerModal.type === 'state') setFormData({ ...formData, state: itemName, city: '' });
    else if (pickerModal.type === 'city') setFormData({ ...formData, city: itemName });
    else if (pickerModal.type === 'specialization') {
      if (isAttorney) {
        setFormData({ ...formData, specialization: itemName });
      } else {
        setFormData({ ...formData, legalNeed: itemName });
      }
    }

    setPickerModal({ ...pickerModal, visible: false });
    setErrors({});
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.35)', 'rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.logoMiniContainer}>
                   <Image 
                     source={require('../../assets/images/logo-full.jpg')} 
                     style={styles.logoMini} 
                     resizeMode="contain"
                   />
                   <Text style={styles.logoText}>Verdict</Text>
                </View>
                <View style={{ width: 44 }} />
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={Colors.goldGradient}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                  <Text style={styles.title}>Sign Up To Your Account.</Text>
                  <Text style={styles.subtitle}>Access your account to manage settings, explore features.</Text>

                  <View style={styles.inputSection}>
                    <Text style={styles.label}>{slides[currentSlide].label}</Text>
                    
                    {currentSlide === 0 && (
                      <View style={[styles.inputBox, focusedField === 'name' && styles.inputBoxActive, errors.name && styles.inputBoxError]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Eleanor Sterling"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          value={formData.name}
                          onChangeText={(v) => setFormData({...formData, name: v})}
                        />
                      </View>
                    )}

                    {currentSlide === 1 && (
                      <View style={[styles.inputBox, focusedField === 'email' && styles.inputBoxActive, errors.email && styles.inputBoxError]}>
                        <TextInput
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={styles.input}
                          placeholder="eleanor@verdict.com"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          value={formData.email}
                          onChangeText={(v) => setFormData({...formData, email: v})}
                        />
                      </View>
                    )}

                    {currentSlide === 2 && (
                      <View style={[styles.inputBox, focusedField === 'phone' && styles.inputBoxActive, errors.phone && styles.inputBoxError]}>
                        <View style={styles.phoneWrapper}>
                          <TouchableOpacity onPress={() => openPicker('country')} style={styles.prefixBtn}>
                            <Text style={styles.prefix}>{countryCode}</Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.white} />
                          </TouchableOpacity>
                          <View style={styles.divider} />
                          <TextInput
                            keyboardType="phone-pad"
                            style={styles.input}
                            placeholder="202 555 0123"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            value={formData.phone}
                            onChangeText={(v) => setFormData({...formData, phone: v})}
                          />
                        </View>
                      </View>
                    )}

                    {currentSlide === 3 && (
                      <View style={styles.locationRow}>
                        <TouchableOpacity onPress={() => openPicker('state')} style={[styles.locationBox, { flex: 1 }, (errors.location || errors.state) && !formData.state && styles.inputBoxError]}>
                          <Text style={[styles.locationText, !formData.state && { color: 'rgba(255,255,255,0.2)' }]}>{formData.state || "State"}</Text>
                          <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openPicker('city')} disabled={!formData.state} style={[styles.locationBox, { flex: 1.2, marginLeft: 12 }, (errors.location || errors.city) && !formData.city && styles.inputBoxError]}>
                          <Text style={[styles.locationText, !formData.city && { color: 'rgba(255,255,255,0.2)' }]}>{formData.city || "City"}</Text>
                          <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {(isAttorney && currentSlide === 4) && (
                      <TouchableOpacity onPress={() => openPicker('specialization')} style={[styles.inputBox, { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, errors.specialization && styles.inputBoxError]}>
                        <Text style={[styles.locationText, !formData.specialization && { color: 'rgba(255,255,255,0.2)' }]}>{formData.specialization || "Select Practice Area"}</Text>
                        <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.2)" />
                      </TouchableOpacity>
                    )}

                    {(!isAttorney && currentSlide === 4) && (
                      <TouchableOpacity onPress={() => setPickerModal({ visible: true, type: 'specialization', data: PRACTICE_AREAS })} style={[styles.inputBox, { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, errors.legalNeed && styles.inputBoxError]}>
                        <Text style={[styles.locationText, !formData.legalNeed && { color: 'rgba(255,255,255,0.2)' }]}>{formData.legalNeed || "Select Legal Need"}</Text>
                        <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.2)" />
                      </TouchableOpacity>
                    )}

                    {(isAttorney && currentSlide === 5) && (
                      <View style={[styles.inputBox, focusedField === 'barId' && styles.inputBoxActive, errors.barId && styles.inputBoxError]}>
                        <TextInput
                          autoCapitalize="characters"
                          style={styles.input}
                          placeholder="CA BAR #123456"
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          onFocus={() => setFocusedField('barId')}
                          onBlur={() => setFocusedField(null)}
                          value={formData.barId}
                          onChangeText={(v) => setFormData({...formData, barId: v})}
                        />
                      </View>
                    )}

                    {Object.values(errors)[0] && <Text style={styles.errorLabel}>{Object.values(errors)[0]}</Text>}
                  </View>

                  <TouchableOpacity
                     style={[styles.getStartedBtn, isSendingSms && { opacity: 0.75 }]}
                     onPress={onNext}
                     disabled={isSendingSms}
                   >
                     <LinearGradient
                       colors={Colors.goldGradient}
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 0 }}
                       style={styles.gradientBtn}
                     >
                       {isSendingSms ? (
                         <ActivityIndicator color={Colors.deepBlue} />
                       ) : (
                         <Text style={styles.btnText}>{currentSlide === slides.length - 1 ? 'Complete Profile' : 'Continue'}</Text>
                       )}
                     </LinearGradient>
                  </TouchableOpacity>



                  <View style={styles.signUpRow}>
                    <Text style={styles.noAccountText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/login-existing')}>
                      <Text style={styles.signUpLink}>Log in</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={pickerModal.visible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
             <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Select {pickerModal.type === 'specialization' ? 'Practice Area' : pickerModal.type}</Text>
                <TouchableOpacity onPress={() => setPickerModal({...pickerModal, visible: false})}><Ionicons name="close" size={24} color={Colors.white}/></TouchableOpacity>
             </View>
             <View style={styles.modalSearch}>
                <Ionicons name="search" size={20} color="rgba(255,255,255,0.3)" />
                <TextInput style={styles.modalSearchInput} placeholder="Search..." placeholderTextColor="rgba(255,255,255,0.3)" value={searchQuery} onChangeText={setSearchQuery} />
             </View>
             <FlatList
                data={pickerModal.data.filter(it => {
                  const name = typeof it === 'string' ? it : it.name;
                  const query = searchQuery.toLowerCase();
                  return name.toLowerCase().includes(query);
                })}
                keyExtractor={it => typeof it === 'string' ? it : (it.id || it.name)}
                renderItem={({item}) => {
                  const name = typeof item === 'string' ? item : item.name;
                  const flag = typeof item === 'string' ? null : item.flag;
                  const code = typeof item === 'string' ? null : item.code;
                  return (
                    <TouchableOpacity style={styles.modalRow} onPress={() => selectFromPicker(item)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {flag && <Text style={{ fontSize: 22 }}>{flag}</Text>}
                        <Text style={styles.modalRowText}>{name}</Text>
                        {code && <Text style={{ color: Colors.subtext, fontSize: 14 }}>({code})</Text>}
                      </View>
                      {((pickerModal.type === 'state' && formData.state === name) || (pickerModal.type === 'city' && formData.city === name) || (pickerModal.type === 'specialization' && formData.specialization === name) || (pickerModal.type === 'country' && countryCode === code)) && <Ionicons name="checkmark-circle" size={20} color={Colors.gold}/>}
                    </TouchableOpacity>
                  );
                }}
             />
          </View>
        </View>
      </Modal>

      <PrivacyConsent visible={showConsent} onAgree={handleAgree} onDecline={() => setShowConsent(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, marginBottom: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  logoMiniContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: { width: 32, height: 32, tintColor: Colors.gold },
  logoText: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.white },
  progressBarContainer: { paddingHorizontal: 24, marginBottom: 20 },
  progressBarBackground: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: Colors.white, textAlign: 'center', marginTop: 10 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.subtext, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  inputSection: { marginBottom: 24 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.white, marginBottom: 10 },
  inputBox: { height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center' },
  inputBoxActive: { borderColor: Colors.gold, backgroundColor: 'rgba(212, 175, 55, 0.05)' },
  inputBoxError: { borderColor: '#EF4444' },
  input: { paddingHorizontal: 16, fontSize: 16, fontFamily: 'Outfit_400Regular', color: Colors.white },
  phoneWrapper: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  prefixBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 16 },
  prefix: { fontSize: 16, fontFamily: 'Outfit_600SemiBold', color: Colors.white },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 12 },
  locationRow: { flexDirection: 'row' },
  locationBox: { height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  locationText: { fontSize: 16, fontFamily: 'Outfit_400Regular', color: Colors.white },
  errorLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#EF4444', marginTop: 6 },
  getStartedBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 10 },
  gradientBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },

  signUpRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 },
  noAccountText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.subtext },
  signUpLink: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.gold },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalBody: { backgroundColor: '#0F172A', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24, borderWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontFamily: 'Outfit_700Bold', color: Colors.white },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalSearchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16, color: Colors.white },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalRowText: { fontSize: 18, color: Colors.white, fontFamily: 'Outfit_400Regular' }
});
