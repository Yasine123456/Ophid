import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './_context/ThemeContext';
import SideMenu from '../components/SideMenu';
import SnakeDetailModal from '../components/SnakeDetailModal';

export default function FirstAidScreen() {
  const router = useRouter();
  const { darkMode, colors } = useTheme();
  const [snakeModalVisible, setSnakeModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleMenuNavigation = (screen: string) => {
    setMenuOpen(false);
    if (screen === 'home') {
      setTimeout(() => router.push('/'), 300);
    } else if (screen === 'snakeguide') {
      setTimeout(() => router.push('/snake-guide'), 300);
    } else if (screen === 'hospital') {
      setTimeout(() => router.push('/nearest-hospital'), 300);
    } else if (screen === 'firstaid') {
      setTimeout(() => router.push('/first-aid'), 300);
    } else if (screen === 'emergency') {
      setTimeout(() => router.push('/emergency-contacts'), 300);
    } else if (screen === 'history') {
      setTimeout(() => router.push('/(tabs)/history'), 300);
    }
  };

  const criticalSteps = [
    {
      number: 1,
      title: 'Call Emergency Services',
      icon: 'call',
      description: 'Call 999 (UK) or 911 (US) immediately. Time is critical.',
      action: 'emergency-contacts',
      actionText: 'View Emergency Numbers',
      color: '#dc2626',
    },
    {
      number: 2,
      title: 'Move to Safety',
      icon: 'walk',
      description: 'Slowly back away from the snake. Do not attempt to catch or kill it.',
      color: '#f59e0b',
    },
    {
      number: 3,
      title: 'Remove Tight Items',
      icon: 'watch',
      description: 'Remove rings, watches, and tight clothing near bite before swelling begins.',
      color: '#dc2626',
    },
    {
      number: 4,
      title: 'Keep Limb Still & Low',
      icon: 'hand-left',
      description: 'Keep bitten area below heart level. Minimize movement to slow venom spread.',
      color: '#dc2626',
    },
  ];

  const secondarySteps = [
    {
      number: 5,
      title: 'Clean the Wound',
      icon: 'water',
      description: 'Gently clean with soap and water. Pat dry with clean cloth.',
    },
    {
      number: 6,
      title: 'Apply Clean Dressing',
      icon: 'bandage',
      description: 'Cover with clean, dry bandage. Do NOT apply tourniquet.',
    },
    {
      number: 7,
      title: 'Note the Time',
      icon: 'time',
      description: 'Record when the bite occurred. Critical for treatment.',
    },
    {
      number: 8,
      title: 'Identify Snake Safely',
      icon: 'camera',
      description: 'Photo from distance or note appearance. Do NOT approach.',
      action: 'snake-guide',
      actionText: 'Use Snake Guide',
    },
  ];

  const donts = [
    { text: 'Apply ice or cold water', icon: 'snow' },
    { text: 'Cut the bite wound', icon: 'cut' },
    { text: 'Suck out venom', icon: 'remove-circle' },
    { text: 'Apply tourniquet', icon: 'ban' },
    { text: 'Give alcohol or caffeine', icon: 'wine' },
    { text: 'Elevate bite above heart', icon: 'arrow-up' },
  ];

  const handleAction = (action: string) => {
    if (action === 'emergency-contacts') {
      router.push('/emergency-contacts');
    } else if (action === 'snake-guide') {
      setSnakeModalVisible(true);
    } else if (action === 'nearest-hospital') {
      router.push('/nearest-hospital');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
	  <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleMenuNavigation}
        darkMode={darkMode}
      />
	  
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>First Aid Guide</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Emergency Banner */}
        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyIconCircle}>
            <Ionicons name="warning" size={32} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Medical Emergency</Text>
            <Text style={styles.emergencyText}>
              Snake bites require immediate professional medical help. Follow these steps while waiting for emergency services.
            </Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.callButton]}
            onPress={() => handleAction('emergency-contacts')}
          >
            <Ionicons name="call" size={24} color="#ffffff" />
            <Text style={styles.quickActionText}>Call 999/911</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.hospitalButton]}
            onPress={() => handleAction('nearest-hospital')}
          >
            <Ionicons name="navigate" size={24} color="#ffffff" />
            <Text style={styles.quickActionText}>Find Hospital</Text>
          </TouchableOpacity>
        </View>

        {/* Critical Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="alert-circle" size={24} color="#dc2626" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Critical Steps (Do Immediately)
            </Text>
          </View>

          {criticalSteps.map((step) => (
            <View
              key={step.number}
              style={[styles.criticalStepCard, { backgroundColor: colors.cardBg, borderColor: step.color }]}
            >
              <View style={[styles.stepIndicator, { backgroundColor: step.color }]}>
                <Text style={styles.stepIndicatorText}>{step.number}</Text>
              </View>
              
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Ionicons name={step.icon as any} size={24} color={step.color} />
                  <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                    {step.title}
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
                
                {step.action && (
                  <TouchableOpacity
                    style={[styles.stepActionButton, { backgroundColor: step.color }]}
                    onPress={() => handleAction(step.action!)}
                  >
                    <Text style={styles.stepActionText}>{step.actionText}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Secondary Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="medical" size={24} color="#2563eb" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Additional Steps
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            While waiting for medical help
          </Text>

          {secondarySteps.map((step) => (
            <View
              key={step.number}
              style={[styles.secondaryStepCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            >
              <View style={styles.secondaryStepNumber}>
                <Text style={[styles.secondaryStepNumberText, { color: '#2563eb' }]}>
                  {step.number}
                </Text>
              </View>
              
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Ionicons name={step.icon as any} size={20} color="#2563eb" />
                  <Text style={[styles.secondaryStepTitle, { color: colors.textPrimary }]}>
                    {step.title}
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
                
                {step.action && (
                  <TouchableOpacity
                    style={[styles.stepActionButton, { backgroundColor: '#2563eb' }]}
                    onPress={() => handleAction(step.action!)}
                  >
                    <Text style={styles.stepActionText}>{step.actionText}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* DO NOT Section - Visual Grid */}
        <View style={styles.section}>
          <View style={[styles.dontsHeader, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
            <Ionicons name="close-circle" size={28} color="#dc2626" />
            <Text style={styles.dontsHeaderTitle}>What NOT to Do</Text>
          </View>

          <View style={styles.dontsGrid}>
            {donts.map((dont, index) => (
              <View
                key={index}
                style={[styles.dontCard, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}
              >
                <View style={styles.dontIconContainer}>
                  <Ionicons name={dont.icon as any} size={32} color="#dc2626" />
                  <View style={styles.dontSlash}>
                    <Ionicons name="close" size={40} color="#dc2626" />
                  </View>
                </View>
                <Text style={[styles.dontText, { color: colors.textPrimary }]}>
                  {dont.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Important Information Cards */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: '#dbeafe', borderColor: '#2563eb' }]}>
            <Ionicons name="time" size={20} color="#2563eb" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: '#1e40af' }]}>Golden Hour</Text>
              <Text style={[styles.infoText, { color: '#1e40af' }]}>
                Antivenom is most effective within 4 hours of the bite. Seek help immediately.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <Ionicons name="people" size={20} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: '#92400e' }]}>Stay With Victim</Text>
              <Text style={[styles.infoText, { color: '#92400e' }]}>
                Never leave victim alone. Monitor breathing and consciousness while waiting for help.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#dcfce7', borderColor: '#16a34a' }]}>
            <Ionicons name="thermometer" size={20} color="#16a34a" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: '#166534' }]}>Keep Victim Calm</Text>
              <Text style={[styles.infoText, { color: '#166534' }]}>
                Staying calm slows heart rate and reduces venom spread throughout the body.
              </Text>
            </View>
          </View>
        </View>

        {/* Symptoms to Watch For */}
        <View style={styles.section}>
          <View style={[styles.symptomsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.symptomsHeader}>
              <Ionicons name="eye" size={24} color="#7c3aed" />
              <Text style={[styles.symptomsTitle, { color: colors.textPrimary }]}>
                Symptoms to Monitor
              </Text>
            </View>
            <Text style={[styles.symptomsSubtitle, { color: colors.textSecondary }]}>
              Watch for these signs and report to medical staff:
            </Text>
            <View style={styles.symptomsList}>
              <View style={styles.symptomRow}>
                <View style={styles.symptomBullet} />
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  Swelling or bruising around bite
                </Text>
              </View>
              <View style={styles.symptomRow}>
                <View style={styles.symptomBullet} />
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  Severe pain or numbness
                </Text>
              </View>
              <View style={styles.symptomRow}>
                <View style={styles.symptomBullet} />
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  Difficulty breathing or swallowing
                </Text>
              </View>
              <View style={styles.symptomRow}>
                <View style={styles.symptomBullet} />
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  Nausea, vomiting, or dizziness
                </Text>
              </View>
              <View style={styles.symptomRow}>
                <View style={styles.symptomBullet} />
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  Rapid pulse or drop in blood pressure
                </Text>
              </View>
              <View style={styles.symptomRow}>
                <View style={styles.symptomBullet} />
                <Text style={[styles.symptomText, { color: colors.textSecondary }]}>
                  Vision problems or dilated pupils
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Get Help Now
          </Text>
          
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.cardBg, borderColor: '#dc2626' }]}
            onPress={() => router.push('/emergency-contacts')}
          >
            <View style={[styles.actionCardIcon, { backgroundColor: '#dc2626' }]}>
              <Ionicons name="call" size={28} color="#ffffff" />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>
                Emergency Contacts
              </Text>
              <Text style={[styles.actionCardSubtitle, { color: colors.textSecondary }]}>
                Call 999, 911, or local emergency services
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#dc2626" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.cardBg, borderColor: '#2563eb' }]}
            onPress={() => router.push('/nearest-hospital')}
          >
            <View style={[styles.actionCardIcon, { backgroundColor: '#2563eb' }]}>
              <Ionicons name="navigate" size={28} color="#ffffff" />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>
                Nearest Hospital
              </Text>
              <Text style={[styles.actionCardSubtitle, { color: colors.textSecondary }]}>
                Find closest emergency department with GPS
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#2563eb" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.cardBg, borderColor: '#16a34a' }]}
            onPress={() => setSnakeModalVisible(true)}
          >
            <View style={[styles.actionCardIcon, { backgroundColor: '#16a34a' }]}>
              <Ionicons name="search" size={28} color="#ffffff" />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={[styles.actionCardTitle, { color: colors.textPrimary }]}>
                Identify Snake
              </Text>
              <Text style={[styles.actionCardSubtitle, { color: colors.textSecondary }]}>
                Search our database to identify the species
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {/* Timeline Visual */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Treatment Timeline
          </Text>
          <View style={[styles.timelineCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#dc2626' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTime, { color: '#dc2626' }]}>0-5 minutes</Text>
                <Text style={[styles.timelineText, { color: colors.textPrimary }]}>
                  Call emergency services, move to safety, remove tight items
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTime, { color: '#f59e0b' }]}>5-15 minutes</Text>
                <Text style={[styles.timelineText, { color: colors.textPrimary }]}>
                  Clean wound, apply dressing, note time, identify snake if safe
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#2563eb' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTime, { color: '#2563eb' }]}>15+ minutes</Text>
                <Text style={[styles.timelineText, { color: colors.textPrimary }]}>
                  Keep monitoring symptoms, stay with victim, wait for help
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Snake Identification Modal */}
      <SnakeDetailModal
        visible={snakeModalVisible}
        showSearch={true}
        onClose={() => setSnakeModalVisible(false)}
        darkMode={darkMode}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emergencyBanner: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  emergencyText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  callButton: {
    backgroundColor: '#dc2626',
  },
  hospitalButton: {
    backgroundColor: '#2563eb',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  criticalStepCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  stepIndicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  stepActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryStepCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  secondaryStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryStepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryStepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  dontsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  dontsHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  dontsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dontCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 120,
  },
  dontIconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dontSlash: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  dontText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  symptomsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  symptomsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  symptomsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  symptomsSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  symptomsList: {
    gap: 10,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  symptomBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
    marginTop: 6,
  },
  symptomText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
  },
  timelineCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#cbd5e1',
    marginLeft: 7,
    marginVertical: 4,
  },
});
