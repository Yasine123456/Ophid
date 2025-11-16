import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Use existing app icon for both themes to avoid missing asset errors
// Theme-aware logos: using existing assets as placeholders.
// Replace these imports with your own files when available:
//   '../assets/images/logo-light.png' and '../assets/images/logo-dark.png'
// Using existing images to avoid missing-asset crash. Replace with your files when added.
// Logo image replaced with text title

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  darkMode?: boolean;
}

export default function SideMenu({ visible, onClose, onNavigate, darkMode = false }: SideMenuProps) {
  const slideAnim = React.useRef(new Animated.Value(-320)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const colors = {
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    textPrimary: darkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: darkMode ? '#cbd5e1' : '#475569',
    border: darkMode ? '#334155' : '#e2e8f0',
  };

  const menuItems = [
    { id: 'home', icon: 'home-outline', label: 'Home', color: '#2563eb' },
    { id: 'emergency', icon: 'call-outline', label: 'Emergency Contacts', color: '#dc2626', isEmergency: true },
    { id: 'firstaid', icon: 'medical-outline', label: 'First Aid Guide', color: '#2563eb' },
    { id: 'snakeguide', icon: 'book-outline', label: 'Snake Guide', color: '#2563eb' },
    { id: 'hospital', icon: 'navigate-outline', label: 'Nearest Hospital', color: '#2563eb' },
    { id: 'history', icon: 'time-outline', label: 'History', color: '#2563eb' },
    { id: 'settings', icon: 'settings-outline', label: 'Settings', color: '#2563eb' },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.menuOverlay}>
        {/* Overlay touchable area */}
        <TouchableOpacity 
          style={styles.menuOverlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Animated side menu */}
        <Animated.View 
          style={[
            styles.sideMenu, 
            { 
              backgroundColor: colors.cardBg,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Menu Header */}
            <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.menuTitle, { color: colors.textPrimary, fontSize: 24 }]}>Ophid</Text>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item) => {
                const isEmergencyDark = darkMode && item.isEmergency;
                return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    item.isEmergency && (isEmergencyDark
                      ? { backgroundColor: '#b91c1c', borderWidth: 2, borderColor: colors.cardBg }
                      : styles.menuItemEmergency),
                  ]}
                  onPress={() => onNavigate(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon as any} size={24} color={isEmergencyDark ? colors.textPrimary : item.color} />
                  <Text style={[
                    styles.menuItemText,
                    item.isEmergency
                      ? (isEmergencyDark ? { color: colors.textPrimary, fontWeight: 'bold' } : styles.menuItemEmergencyText)
                      : { color: colors.textPrimary }
                  ]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={isEmergencyDark ? colors.textPrimary : colors.textSecondary} />
                </TouchableOpacity>
              );})}
            </View>

            {/* Menu Footer */}
            <View style={[styles.menuFooter, { backgroundColor: darkMode ? '#334155' : '#f1f5f9', borderColor: colors.border }]}>
              <Ionicons name="heart" size={16} color={colors.textSecondary} />
              <Text style={[styles.menuFooterText, { color: colors.textSecondary }]}>
                Medical guidance at your fingertips
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuOverlayTouchable: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 2,
  },
  menuLogoImage: {
    width: 160, // adjust to taste
    height: 32, // adjust 28–36 for balance
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  }, 
  menuHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLogo: {
    width: 48,
    height: 48,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  menuLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    padding: 16,
    paddingTop: 24,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    paddingLeft: 20,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  menuItemEmergency: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    marginVertical: 4,
  },
  menuItemEmergencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b91c1c',
    flex: 1,
  },
  menuFooter: {
    margin: 24,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  menuFooterText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
