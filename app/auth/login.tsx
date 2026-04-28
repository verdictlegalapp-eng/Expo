import React, { useState, useRef } from 'react';
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
  Animated,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PRACTICE_AREAS } from '../../constants/Legal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Data for pickers
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

import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';



export default function Login() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const { userRole, setRole } = useUser();
  const isAttorney = userRole === 'attorney';
  
  // Sync role to context if it's provided in params but doesn't match
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
    barId: ''
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);



  // Simple slides array for metadata - will use direct rendering below
  const slides = [
    { key: 'name', label: 'FULL NAME', title: 'What is your full name?' },
    { key: 'email', label: 'EMAIL ADDRESS', title: 'How can we reach you?' },
    { key: 'phone', label: 'MOBILE NUMBER', title: 'What is your mobile number?' },
    { key: 'location', label: 'LOCATION', title: 'Where are you based?' },
    ...(isAttorney ? [
      { key: 'specialization', label: 'PRACTICE AREA', title: 'What is your practice area?' },
      { key: 'barId', label: 'LICENSE ID', title: 'Verify your credentials' }
    ] : [])
  ];

  const formatPhoneNumber = (text: string) => {
    return text.replace(/\D/g, '');
  };

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
    const resolvedRole =
      typeof role === 'string' && role.length ? role : userRole;
    router.push({
      pathname: '/auth/otp',
      params: {
        ...formData,
        role: resolvedRole,
      },
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

    setIsSendingSms(true);
    try {
      const { requestEmailOtp } = require('../../lib/authApi');
      await requestEmailOtp(formData.email);
      goToOtp();
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

  // Picker states
  const [pickerModal, setPickerModal] = useState<{ 
    visible: boolean; 
    type: 'state' | 'city' | 'specialization' | 'country'; 
    data: any[] 
  }>({
    visible: false, type: 'state', data: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  const openPicker = (type: 'state' | 'city' | 'specialization' | 'country') => {
    let data: any[] = [];
    if (type === 'state') {
      data = Object.keys(USA_DATA).sort();
    } else if (type === 'city') {
      data = formData.state ? USA_DATA[formData.state].sort() : [];
    } else if (type === 'specialization') {
      data = PRACTICE_AREAS;
    } else if (type === 'country') {
      data = COUNTRY_CODES;
    }
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
    
    if (pickerModal.type === 'state') {
      setFormData({ ...formData, state: itemName, city: '' });
    } else if (pickerModal.type === 'city') {
      setFormData({ ...formData, city: itemName });
    } else if (pickerModal.type === 'specialization') {
      setFormData({ ...formData, specialization: itemName });
    }
    
    setPickerModal({ ...pickerModal, visible: false });
    setErrors({});
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
         <LinearGradient
           colors={Colors.brandGradient}
           start={{ x: 0, y: 0.5 }}
           end={{ x: 1, y: 0.5 }}
           style={[styles.progressFill, { width: `${progress}%` }]}
         />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                  <Ionicons name="arrow-back" size={28} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepIndicator}>STEP {currentSlide + 1} / {slides.length}</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>{slides[currentSlide].title}</Text>
                <Text style={styles.label}>{slides[currentSlide].label}</Text>

                {/* HARD RESET: Direct rendering of question content */}
                {currentSlide === 0 && (
                  <View style={[styles.inputBox, focusedField === 'name' && styles.inputBoxActive, errors.name && styles.inputBoxError]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Eleanor Sterling"
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      value={formData.name}
                      onChangeText={(v) => setFormData({...formData, name: v})}
                    />
                  </View>
                )}
                {/* ... (remaining conditional renders) ... */}

          {currentSlide === 1 && (
            <View style={[styles.inputBox, focusedField === 'email' && styles.inputBoxActive, errors.email && styles.inputBoxError]}>
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholder="eleanor@verdict.com"
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
                  <Ionicons name="chevron-down" size={16} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TextInput
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholder="202 555 0123"
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
                <Text style={[styles.locationText, !formData.state && { color: '#94A3B8' }]}>{formData.state || "State"}</Text>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openPicker('city')} disabled={!formData.state} style={[styles.locationBox, { flex: 1.2, marginLeft: 12 }, (errors.location || errors.city) && !formData.city && styles.inputBoxError]}>
                <Text style={[styles.locationText, !formData.city && { color: '#94A3B8' }]}>{formData.city || "City"}</Text>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}

          {isAttorney && currentSlide === 4 && (
            <View style={styles.specializationContainer}>
               <TouchableOpacity 
                 onPress={() => openPicker('specialization')} 
                 style={[styles.inputBox, { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, errors.specialization && styles.inputBoxError]}
               >
                 <Text style={[styles.locationText, !formData.specialization && { color: '#94A3B8' }]}>
                   {formData.specialization || "Select Practice Area"}
                 </Text>
                 <Ionicons name="chevron-down" size={20} color="#94A3B8" />
               </TouchableOpacity>
            </View>
          )}

          {isAttorney && currentSlide === 5 && (
            <View style={[styles.inputBox, focusedField === 'barId' && styles.inputBoxActive, errors.barId && styles.inputBoxError]}>
              <TextInput
                autoCapitalize="characters"
                style={styles.input}
                placeholder="CA BAR #123456"
                onFocus={() => setFocusedField('barId')}
                onBlur={() => setFocusedField(null)}
                value={formData.barId}
                onChangeText={(v) => setFormData({...formData, barId: v})}
              />
            </View>
          )}


          {Object.values(errors)[0] && <Text style={styles.errorLabel}>{Object.values(errors)[0]}</Text>}
        </View>

        <View style={styles.footer}>
           <TouchableOpacity
             style={[styles.btnWrapper, isSendingSms && { opacity: 0.75 }]}
             onPress={() => void onNext()}
             disabled={isSendingSms}
           >
              <View style={styles.btn}>
                {isSendingSms ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnText}>
                      {currentSlide === slides.length - 1 ? 'Complete Profile' : 'Continue'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </View>
           </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>



      <Modal visible={pickerModal.visible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
             <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Select {pickerModal.type === 'specialization' ? 'Practice Area' : pickerModal.type}</Text>
                <TouchableOpacity onPress={() => setPickerModal({...pickerModal, visible: false})}><Ionicons name="close" size={24} color="black"/></TouchableOpacity>
             </View>
             <View style={styles.modalSearch}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput 
                  style={styles.modalSearchInput} 
                  placeholder="Search..." 
                  value={searchQuery} 
                  onChangeText={setSearchQuery}
                />
             </View>
             <FlatList
                data={pickerModal.data.filter(it => {
                  const name = typeof it === 'string' ? it : it.name;
                  const code = typeof it === 'string' ? '' : it.code;
                  const query = searchQuery.toLowerCase();
                  return name.toLowerCase().includes(query) || code.toLowerCase().includes(query);
                })}
                keyExtractor={it => typeof it === 'string' ? it : (it.id || it.name + it.code)}
                renderItem={({item}) => {
                  const name = typeof item === 'string' ? item : item.name;
                  const icon = typeof item === 'string' ? null : item.icon;
                  const flag = typeof item === 'string' ? null : item.flag;
                  const code = typeof item === 'string' ? null : item.code;

                  return (
                    <TouchableOpacity style={styles.modalRow} onPress={() => selectFromPicker(item)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {flag && <Text style={{ fontSize: 22 }}>{flag}</Text>}
                        {icon && <MaterialCommunityIcons name={icon as any} size={22} color="#3B82F6" />}
                        <Text style={styles.modalRowText}>{name}</Text>
                        {code && <Text style={[styles.modalRowText, { color: '#64748B', fontSize: 14 }]}>({code})</Text>}
                      </View>
                      {((pickerModal.type === 'state' && formData.state === name) || 
                        (pickerModal.type === 'city' && formData.city === name) ||
                        (pickerModal.type === 'specialization' && formData.specialization === name) ||
                        (pickerModal.type === 'country' && countryCode === code)
                       ) && <Ionicons name="checkmark-circle" size={20} color="#3B82F6"/>}
                    </TouchableOpacity>
                  );
                }}
             />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  statusBar: { height: 6, backgroundColor: '#F1F5F9' },
  progressFill: { height: '100%', borderRadius: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 16 },
  stepIndicator: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#94A3B8', letterSpacing: 1.5 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: '#0F172A', marginBottom: 8, lineHeight: 40 },
  label: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#64748B', letterSpacing: 1, marginBottom: 32, textTransform: 'uppercase' },
  inputBox: { height: 68, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', overflow: 'hidden' },
  inputBoxActive: { borderColor: Colors.electricBlue, backgroundColor: '#FFFFFF', shadowColor: Colors.electricBlue, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  inputBoxError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  input: { flex: 1, paddingHorizontal: 16, fontSize: 18, fontFamily: 'Outfit_400Regular', color: '#0F172A' },
  phoneWrapper: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  prefixBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 20 },
  prefix: { fontSize: 18, fontFamily: 'Outfit_600SemiBold', color: '#0F172A' },
  divider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginLeft: 12 },
  locationRow: { flexDirection: 'row' },
  locationBox: { height: 68, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  locationText: { fontSize: 18, fontFamily: 'Outfit_400Regular', color: '#0F172A' },
  errorLabel: { marginTop: 8, color: '#EF4444', fontSize: 13, fontFamily: 'Outfit_400Regular', marginLeft: 4 },
  footer: { padding: 24, paddingBottom: 40 },
  btnWrapper: { 
    borderRadius: 32, 
    overflow: 'hidden',
    backgroundColor: Colors.navy
  },
  btn: { 
    height: 64, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12 
  },
  btnText: { color: 'white', fontSize: 18, fontFamily: 'Outfit_700Bold' },
  specializationContainer: { position: 'relative', zIndex: 100 },
  suggestionDrop: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 10, zIndex: 200 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  suggestionText: { fontSize: 16, fontFamily: 'Outfit_600SemiBold', color: '#1E293B' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBody: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'Outfit_700Bold', color: '#0F172A' },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  modalSearchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalRowText: { fontSize: 18, color: '#0F172A', fontFamily: 'Outfit_400Regular' }
});
