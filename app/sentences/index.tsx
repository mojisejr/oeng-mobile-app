import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, Filter, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useClerkAuth } from '@/hooks/useClerkAuth';

interface Sentence {
  id: string;
  englishSentence: string;
  userTranslation?: string;
  context?: string;
  status: 'pending' | 'analyzed';
  createdAt: string;
  updatedAt?: string;
  analysisResult?: any;
}

type FilterType = 'all' | 'pending' | 'analyzed';

export default function SavedSentencesScreen() {
  const { user } = useClerkAuth();
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [filteredSentences, setFilteredSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (user) {
      fetchSentences();
    }
  }, [user]);

  useEffect(() => {
    filterSentences();
  }, [sentences, searchQuery, activeFilter]);

  const fetchSentences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sentences/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSentences(data.sentences || []);
      } else {
        throw new Error('Failed to fetch sentences');
      }
    } catch (error) {
      console.error('Error fetching sentences:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดประโยคที่บันทึกไว้ได้');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSentences();
    setRefreshing(false);
  };

  const filterSentences = () => {
    let filtered = sentences;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(sentence => sentence.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(sentence => 
        sentence.englishSentence.toLowerCase().includes(query) ||
        sentence.userTranslation?.toLowerCase().includes(query) ||
        sentence.context?.toLowerCase().includes(query)
      );
    }

    setFilteredSentences(filtered);
  };

  const handleSentencePress = (sentence: Sentence) => {
    if (sentence.status === 'pending') {
      // Navigate to analysis screen or trigger analysis
      Alert.alert('วิเคราะห์ประโยค', 'ต้องการวิเคราะห์ประโยคนี้หรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'วิเคราะห์', onPress: () => analyzeSentence(sentence) }
      ]);
    } else {
      // Navigate to analysis result screen
      // TODO: Implement sentence detail view
      Alert.alert('Coming Soon', 'Sentence detail view will be implemented in the next phase.');
    }
  };

  const analyzeSentence = async (sentence: Sentence) => {
    try {
      Alert.alert('กำลังวิเคราะห์', 'กรุณารอสักครู่...');
      
      const response = await fetch('/api/sentences/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          sentenceId: sentence.id
        })
      });
      
      if (response.ok) {
        Alert.alert('สำเร็จ', 'วิเคราะห์ประโยคเสร็จสิ้น');
        await fetchSentences(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing sentence:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถวิเคราะห์ประโยคได้');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'analyzed':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอวิเคราะห์';
      case 'analyzed':
        return 'วิเคราะห์แล้ว';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'all') return sentences.length;
    return sentences.filter(s => s.status === filter).length;
  };

  const renderSentenceCard = (sentence: Sentence) => (
    <Card key={sentence.id} className="mb-3">
      <CardContent className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <ThemedText className="text-base font-medium mb-1">
              {sentence.englishSentence}
            </ThemedText>
            {sentence.userTranslation && (
              <ThemedText className="text-sm text-gray-600 mb-1">
                แปล: {sentence.userTranslation}
              </ThemedText>
            )}
            {sentence.context && (
              <ThemedText className="text-xs text-gray-500 mb-2">
                บริบท: {sentence.context}
              </ThemedText>
            )}
          </View>
          <View className="items-end">
            <View className="flex-row items-center mb-1">
              {getStatusIcon(sentence.status)}
              <ThemedText className="text-xs ml-1">
                {getStatusText(sentence.status)}
              </ThemedText>
            </View>
            <ThemedText className="text-xs text-gray-400">
              {new Date(sentence.createdAt).toLocaleDateString('th-TH')}
            </ThemedText>
          </View>
        </View>
        
        <Button
          variant={sentence.status === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => handleSentencePress(sentence)}
          className="self-start"
        >
          <ThemedText className={`text-sm font-medium ${
            sentence.status === 'pending' ? 'text-white' : 'text-gray-700'
          }`}>
            {sentence.status === 'pending' ? 'วิเคราะห์' : 'ดูผลลัพธ์'}
          </ThemedText>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ThemedView className="flex-1">
      <SignedIn>
        <ScrollView 
          className="flex-1 p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="mb-4">
            <ThemedText className="text-2xl font-bold mb-2">
              ประโยคที่บันทึกไว้
            </ThemedText>
            <ThemedText className="text-gray-600">
              จัดการและวิเคราะห์ประโยคภาษาอังกฤษของคุณ
            </ThemedText>
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={20} className="text-gray-500 mr-2" />
              <TextInput
                className="flex-1 text-base"
                placeholder="ค้นหาประโยค..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row mb-4">
            {(['all', 'pending', 'analyzed'] as FilterType[]).map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setActiveFilter(filter)}
                className="mr-2 flex-row items-center"
              >
                <Filter size={14} className="mr-1" />
                <ThemedText className={`text-sm ${
                  activeFilter === filter ? 'text-white' : 'text-gray-700'
                }`}>
                  {filter === 'all' ? 'ทั้งหมด' : 
                   filter === 'pending' ? 'รอวิเคราะห์' : 'วิเคราะห์แล้ว'}
                  {` (${getFilterCount(filter)})`}
                </ThemedText>
              </Button>
            ))}
          </View>

          {/* Content */}
          {loading ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#2563eb" />
              <ThemedText className="text-gray-500 mt-2">
                กำลังโหลดประโยค...
              </ThemedText>
            </View>
          ) : filteredSentences.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <FileText size={48} className="text-gray-300 mb-4" />
              <ThemedText className="text-lg font-medium text-gray-500 mb-2">
                {searchQuery || activeFilter !== 'all' ? 'ไม่พบประโยคที่ตรงกับเงื่อนไข' : 'ยังไม่มีประโยคที่บันทึกไว้'}
              </ThemedText>
              <ThemedText className="text-gray-400 text-center">
                {searchQuery || activeFilter !== 'all' ? 
                  'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 
                  'เริ่มต้นด้วยการเพิ่มประโยคใหม่ในหน้าหลัก'
                }
              </ThemedText>
              {!searchQuery && activeFilter === 'all' && (
                <Button
                  variant="primary"
                  onPress={() => router.push('/')}
                  className="mt-4"
                >
                  <ThemedText className="text-white font-medium">
                    เพิ่มประโยคใหม่
                  </ThemedText>
                </Button>
              )}
            </View>
          ) : (
            <View>
              {filteredSentences.map(renderSentenceCard)}
            </View>
          )}
        </ScrollView>
      </SignedIn>
      
      <SignedOut>
        <View className="flex-1 items-center justify-center p-4">
          <FileText size={64} className="text-gray-300 mb-4" />
          <ThemedText className="text-xl font-semibold text-gray-600 mb-2">
            เข้าสู่ระบบเพื่อดูประโยคที่บันทึกไว้
          </ThemedText>
          <ThemedText className="text-gray-500 text-center mb-4">
            กรุณาเข้าสู่ระบบเพื่อเข้าถึงประโยคที่คุณได้บันทึกไว้
          </ThemedText>
          <Button
            variant="primary"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <ThemedText className="text-white font-medium">
              เข้าสู่ระบบ
            </ThemedText>
          </Button>
        </View>
      </SignedOut>
    </ThemedView>
  );
}