import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Help = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "How do I create a new project?",
      answer: "To create a new project, go to the Dashboard and tap on 'Add New Project' button, or navigate to Projects section and tap the plus icon. Fill in the project details including name, description, start date, and estimated end date."
    },
    {
      id: 2,
      question: "How can I add members to my project?",
      answer: "Open your project details, scroll down to the 'Project members' section, and tap 'Add members'. You can search for users by email or username and send them project invitations."
    },
    {
      id: 3,
      question: "How do I track project expenses?",
      answer: "Navigate to the Expense Tracking section from the main menu. You can add new expenses, set budgets, view expense reports, and track spending across all your projects."
    },
    {
      id: 4,
      question: "Can I upload photos to my project?",
      answer: "Yes! In your project details, tap on the 'Photos' button to upload and view project photos. You can capture new photos or select from your gallery."
    },
    {
      id: 5,
      question: "How do I delete a project?",
      answer: "Open the project details, tap the three dots menu in the top right corner, and select 'Delete Project'. Note that this action cannot be undone."
    },
    {
      id: 6,
      question: "What are project stages/milestones?",
      answer: "Stages represent different phases of your construction project (e.g., Foundation, Framing, Roofing). You can track progress and manage each stage separately."
    },
    {
      id: 7,
      question: "How do I reset my password?",
      answer: "On the login screen, tap 'Forgot Password', enter your email address, and follow the instructions sent to your email to reset your password."
    },
    {
      id: 8,
      question: "Can I chat with project members?",
      answer: "Yes! Each project has a built-in chat feature. Go to your project details and tap the 'Chat' button to communicate with all project members."
    }
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openEmail = () => {
    const email = 'support@homebuildpro.com';
    const subject = 'Home Build Pro - Support Request';
    const body = 'Hi Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nThank you!';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            'Email Not Available', 
            'Please send an email to: support@homebuildpro.com'
          );
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open email application');
        console.error('Email error:', err);
      });
  };

  const makePhoneCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Phone Not Available', `Please call: ${phoneNumber}`);
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open phone application');
        console.error('Phone error:', err);
      });
  };

  const openWebsite = () => {
    const url = 'https://www.homebuildpro.com';
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Browser Not Available', 'Please visit: www.homebuildpro.com');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open browser');
        console.error('Website error:', err);
      });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#F6BD0F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqData.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(item.id)}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                <Icon 
                  name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#F6BD0F" 
                />
              </TouchableOpacity>
              
              {expandedFAQ === item.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.contactDescription}>
            Need more help? Get in touch with our support team.
          </Text>

          {/* Email Contact */}
          <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
            <View style={styles.contactIcon}>
              <Icon name="email" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@homebuildpro.com</Text>
              <Text style={styles.contactSubtext}>Response within 24 hours</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#F6BD0F" />
          </TouchableOpacity>

          {/* Phone Contact */}
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => makePhoneCall('+1-800-HOME-PRO')}
          >
            <View style={styles.contactIcon}>
              <Icon name="phone" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>+94-76-310-2759</Text>
              <Text style={styles.contactSubtext}>Mon-Fri, 9 AM - 6 PM EST</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#F6BD0F" />
          </TouchableOpacity>

          {/* Website Contact */}
          <TouchableOpacity style={styles.contactItem} onPress={openWebsite}>
            <View style={styles.contactIcon}>
              <Icon name="web" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>www.homebuildpro.com</Text>
              <Text style={styles.contactSubtext}>Visit our help center</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#F6BD0F" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Home Build Pro</Text>
            <Text style={styles.appInfoSubtext}>Version 1.0.0</Text>
            <Text style={styles.appInfoSubtext}>Build your dream home with confidence</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 10,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  answerText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  contactDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F6BD0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#F6BD0F',
    marginBottom: 2,
  },
  contactSubtext: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  appInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 2,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default Help;