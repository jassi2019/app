import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile, useUpdateUser } from '@/hooks/api/user';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ChevronRight, Lock, LogOut } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header/Header';

type AccountProps = {
  navigation: any;
};

export const Profile = ({ navigation }: AccountProps) => {
  const { user, setUser } = useAuth();
  const { mutate, isPending } = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedBio, setEditedBio] = useState(user?.bio || '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch,
  } = useGetProfile();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUpgrade = () => {
    navigation.navigate('Plans');
  };

  const handleUpdateProfile = () => {
    mutate(
      { name: editedName, bio: editedBio, id: user?.id },
      {
        onSuccess: (data: any) => {
          setIsEditing(false);
          refetch();
          if (data?.data) {
            setUser(data.data);
          }
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    mutate(
      { id: profile?.data?.id, password: newPassword, currentPassword },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Password updated successfully');
          setShowPasswordForm(false);
          setCurrentPassword('');
          setNewPassword('');
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderSubscriptionStatus = () => {
    return (
      <View
        style={[
          styles.badge,
          profile?.data?.subscription?.paymentStatus === 'SUCCESS'
            ? styles.premiumBadge
            : styles.freemiumBadge,
        ]}
      >
        <Text style={styles.badgeText}>
          {(() => {
            switch (profile?.data?.subscription?.paymentStatus) {
              case 'PENDING':
                return 'Free';
              case 'SUCCESS':
                return 'Premium';
              default:
                return 'Free';
            }
          })()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.innerContainer}>
        <Header title="My Account" onBack={handleBack} />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {profile?.data?.profilePicture ? (
                <Image
                  source={{ uri: profile?.data?.profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.initialsText}>{getInitials(profile?.data?.name || '')}</Text>
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.profileName}>{profile?.data?.name}</Text>
              )}
              <Text style={styles.profileEmail}>{profile?.data?.email}</Text>
              {renderSubscriptionStatus()}
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <View style={styles.bioHeader}>
              <Text style={styles.sectionTitle}>Bio</Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                  <MaterialIcons name="edit" size={20} color="#4A635D" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View>
                <TextInput
                  style={styles.bioInput}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />

                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setEditedName(profile?.data?.name || '');
                      setEditedBio(profile?.data?.bio || '');
                    }}
                    style={styles.cancelButton}
                  >
                    <MaterialIcons name="close" size={18} color="#666" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleUpdateProfile}
                    style={styles.saveButton}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <MaterialIcons name="check" size={18} color="white" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.bioText}>{user?.bio || 'No bio added yet'}</Text>
            )}
          </View>

          {/* Upgrade Card */}
          {profile?.data?.subscription?.paymentStatus !== 'SUCCESS' && (
            <View style={styles.upgradeCard}>
              <Text style={styles.upgradeTitle}>Upgrade To Premium</Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={10} color="white" />
                  </View>
                  <Text style={styles.featureText}>Access to all premium tutorials</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={10} color="white" />
                  </View>
                  <Text style={styles.featureText}>Priority support</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={10} color="white" />
                  </View>
                  <Text style={styles.featureText}>Quality content</Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleUpgrade} style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade To Pro</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingsCard}>
              <TouchableOpacity
                onPress={() => setShowPasswordForm(!showPasswordForm)}
                style={styles.settingsItem}
              >
                <View style={styles.settingsItemLeft}>
                  <Lock size={20} color="#4A635D" />
                  <Text style={styles.settingsItemText}>Change Password</Text>
                </View>
                <ChevronRight size={20} color="#4A635D" />
              </TouchableOpacity>

              {showPasswordForm && (
                <View style={styles.passwordForm}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Current Password"
                    placeholderTextColor="#999"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                  />
                  <TextInput
                    style={[styles.passwordInput, styles.passwordInputSpacing]}
                    placeholder="New Password"
                    placeholderTextColor="#999"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                  <TouchableOpacity
                    onPress={handlePasswordUpdate}
                    style={styles.updatePasswordButton}
                    disabled={isPending}
                  >
                    <Text style={styles.updatePasswordButtonText}>
                      {isPending ? 'Updating...' : 'Update Password'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutItem}>
                <View style={styles.settingsItemLeft}>
                  <LogOut size={20} color="#EF4444" />
                  <Text style={styles.logoutText}>Logout</Text>
                </View>
                <ChevronRight size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#4A635D',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 36,
    fontWeight: '500',
    color: '#000000',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  nameInput: {
    fontSize: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  premiumBadge: {
    backgroundColor: '#F59E0B',
  },
  freemiumBadge: {
    backgroundColor: '#588157',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bioSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#4A635D',
    marginLeft: 4,
    fontSize: 14,
  },
  bioInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#374151',
  },
  bioText: {
    color: '#6B7280',
    fontSize: 14,
    minHeight: 50,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4A635D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  upgradeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1E1E1E',
    padding: 24,
    borderRadius: 24,
  },
  upgradeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    backgroundColor: '#374151',
    borderRadius: 20,
    padding: 4,
  },
  featureText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  settingsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    color: '#374151',
    marginLeft: 12,
    fontSize: 16,
  },
  passwordForm: {
    padding: 16,
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  passwordInputSpacing: {
    marginTop: 8,
  },
  updatePasswordButton: {
    backgroundColor: '#4A635D',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  updatePasswordButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  logoutText: {
    color: '#EF4444',
    marginLeft: 12,
    fontSize: 16,
  },
});

export default Profile;
