import { ChapterListingCard } from '@/components/ChapterCard/ChapterCard';
import { useGetChaptersBySubjectId } from '@/hooks/api/chapters';
import { useGetAllClasses } from '@/hooks/api/classes';
import { TChapter } from '@/types/Chapter';
import { TClass } from '@/types/Class';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChaptersScreenProps = {
  navigation: any;
  route: {
    params?: {
      subjectId?: string;
      subjectTitle?: string;
    };
  };
};

export const Chapters = ({ navigation, route }: ChaptersScreenProps) => {
  // ============================================================================
  // ROUTE PARAMS (SAFELY GUARDED)
  // ============================================================================
  const subjectId = route?.params?.subjectId;
  const subjectTitle = route?.params?.subjectTitle;

  // Guard against missing params - show error state instead of crashing
  if (!subjectId || !subjectTitle) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <Text style={styles.errorText}>Invalid subject data. Please try again.</Text>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // STATE
  // ============================================================================
  const [selectedClass, setSelectedClass] = useState<TClass['id'] | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // ============================================================================
  // FETCH CLASSES
  // ============================================================================
  const { data: classes, isLoading: classesLoading, error: classesError } = useGetAllClasses();

  // Auto-select first class when classes are loaded (only once)
  useEffect(() => {
    if (classes?.data?.length && !selectedClass) {
      setSelectedClass(classes.data[0].id);
    }
  }, [classes, selectedClass]);

  // ============================================================================
  // FETCH CHAPTERS (ONLY WHEN BOTH subjectId AND selectedClass EXIST)
  // ============================================================================
  const {
    data: chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
  } = useGetChaptersBySubjectId(
    { subjectId, classId: selectedClass as string },
    {
      // CRITICAL: Only fetch when we have a valid classId
      enabled: Boolean(subjectId && selectedClass),
    }
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleBack = () => {
    navigation.goBack();
  };

  const handleChapterPress = async (chapter: TChapter) => {
    // Directly open first topic content instead of Topics screen
    try {
      // Fetch topics for this chapter
      const response = await fetch(
        `YOUR_API_URL/api/v1/topics?chapterId=${chapter.id}&subjectId=${subjectId}`
      );
      const data = await response.json();

      if (data?.data?.length > 0) {
        // Navigate directly to first topic content
        navigation.navigate('TopicContent', {
          topic: data.data[0],
        });
      } else {
        // If no topics, show Topics screen
        navigation.navigate('Topics', {
          subjectId,
          subjectTitle,
          chapterId: chapter.id,
          chapterTitle: chapter.name,
          chapterNumber: chapter.number,
        });
      }
    } catch (error) {
      // On error, fallback to Topics screen
      navigation.navigate('Topics', {
        subjectId,
        subjectTitle,
        chapterId: chapter.id,
        chapterTitle: chapter.name,
        chapterNumber: chapter.number,
      });
    }
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleClassSelect = (classId: TClass['id']) => {
    setSelectedClass(classId);
    setIsDropdownVisible(false);
  };

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  if (classesLoading || (chaptersLoading && selectedClass)) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator size="large" color="#F1BB3E" />
      </SafeAreaView>
    );
  }

  if (classesError || chaptersError) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <Text style={styles.errorText}>
          {classesError?.message || chaptersError?.message || 'Something went wrong'}
        </Text>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color="#000" />
          <Text style={styles.title}>{subjectTitle}</Text>
        </TouchableOpacity>

        {/* CLASS DROPDOWN */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>
              {selectedClass
                ? classes?.data?.find((c: TClass) => c.id === selectedClass)?.name || 'Select Class'
                : 'Select Class'}
            </Text>
            <ChevronDown size={16} color="#000" />
          </TouchableOpacity>

          {isDropdownVisible && (
            <View style={styles.dropdownMenu}>
              {classes?.data?.map((classItem: TClass) => (
                <TouchableOpacity
                  key={classItem.id}
                  onPress={() => handleClassSelect(classItem.id)}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>{classItem.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!chapters?.data?.length ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Chapters Found</Text>
          </View>
        ) : (
          chapters.data.map((chapter: TChapter) => (
            <ChapterListingCard
              key={chapter.id}
              chapter={chapter}
              onPress={() => handleChapterPress(chapter)}
            />
          ))
        )}
      </ScrollView>

      {/* PREMIUM MODAL */}
      <NoSubscriptionAlertModal
        showPremiumModal={showPremiumModal}
        setShowPremiumModal={setShowPremiumModal}
        onPress={() => {
          setShowPremiumModal(false);
          navigation.navigate('Plans');
        }}
      />
    </SafeAreaView>
  );
};

// ==============================================================================
// PREMIUM MODAL COMPONENT
// ==============================================================================
const NoSubscriptionAlertModal = ({
  showPremiumModal,
  setShowPremiumModal,
  onPress,
}: {
  showPremiumModal: boolean;
  setShowPremiumModal: (value: boolean) => void;
  onPress: () => void;
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={showPremiumModal}
    onRequestClose={() => setShowPremiumModal(false)}
  >
    <TouchableWithoutFeedback onPress={() => setShowPremiumModal(false)}>
      <View style={modalStyles.backdrop}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>You don't have premium subscription!</Text>

            <Text style={modalStyles.description}>
              Access premium content with premium subscription
            </Text>

            <TouchableOpacity style={modalStyles.button} onPress={onPress}>
              <Text style={modalStyles.buttonText}>Upgrade To Pro</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

// ==============================================================================
// STYLES
// ==============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF6F0',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    marginRight: 8,
    fontSize: 14,
    color: '#000',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
    zIndex: 50,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#F4B95F',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default Chapters;
