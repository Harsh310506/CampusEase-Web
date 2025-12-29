import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchSubjectsByDepartmentAndSemester, type Subject } from '@/services/subjectService';
import { useToast } from '@/hooks/use-toast';

const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

const dummyLinks: Record<string, Record<string, string>> = {
  'E-Books': {
    'DCN': 'https://docs.google.com/presentation/d/1ytB736-rV_xv0WpEUepxUbyx8kHBm4kd/edit?usp=sharing&ouid=105105133129519254235&rtpof=true&sd=true',
    'DAA': 'https://drive.google.com/file/d/1ytB736-rV_xv0WpEUepxUbyx8kHBm4kd/view',
    'Python Programming': 'https://example.com/python/ebook/unit',
  },
  'Video Lectures': {
    'DCN': 'https://example.com/dcn/video/unit',
    'DAA': 'https://example.com/daa/video/unit',
    'Python Programming': 'https://example.com/python/video/unit',
  },
};

const sam_4 = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      // Load subjects for Computer Science department, semester 4
      const data = await fetchSubjectsByDepartmentAndSemester('CS', 4);
      setSubjects(data);
      if (data.length === 0) {
        toast({
          title: 'No Subjects',
          description: 'No subjects found for semester 4. Please add subjects in Subject Management.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects from database.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousYearPapers = (type: string, subjectName: string) => {
    alert(`${type} - ${subjectName}`);
  };

  const getUnitUrl = (type: string, subjectName: string, unitIndex: number) => {
    const baseUrl = dummyLinks[type]?.[subjectName];
    if (!baseUrl) return '#';
    return `${baseUrl}/unit${unitIndex + 1}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-campusteal-700">Semester 4 Resources</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {['E-Books', 'Video Lectures', 'Previous Year Papers'].map((type, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card
                  className="p-6 cursor-pointer border text-center hover:shadow-lg hover:border-campusteal-500 bg-white transition-all"
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedSubject(null);
                  }}
                >
                  <h2 className="text-xl font-semibold text-campusteal-600">{type}</h2>
                  <p className="text-sm text-gray-500 mt-1">Tap to select subject</p>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                {!selectedSubject ? (
                  <>
                    <h3 className="text-xl font-bold mb-4 text-campusteal-700">{selectedType} - Choose Subject</h3>
                    {loading ? (
                      <p className="text-center text-gray-500 py-4">Loading subjects...</p>
                    ) : subjects.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">No subjects available for semester 4.</p>
                        <p className="text-sm text-gray-400">Please add subjects in Subject Management.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {subjects.map((subject) => (
                          <Card
                            key={subject.id}
                            className="p-4 cursor-pointer border hover:bg-campusteal-50 hover:border-campusteal-600 transition"
                            onClick={() =>
                              selectedType !== 'Previous Year Papers'
                                ? setSelectedSubject(subject.name)
                                : handlePreviousYearPapers(selectedType, subject.name)
                            }
                          >
                            <h4 className="text-base font-medium text-campusteal-700">
                              {subject.name} ({subject.code})
                            </h4>
                            {subject.description && (
                              <p className="text-xs text-gray-500 mt-1">{subject.description}</p>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-campusteal-600">
                      {selectedSubject} - {selectedType} Units
                    </h3>
                    <div className="grid gap-3">
                      {units.map((unit, i) => (
                        <a
                          key={i}
                          href={getUnitUrl(selectedType, selectedSubject, i)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white border border-campusteal-300 rounded-lg px-4 py-2 text-campusteal-700 hover:bg-campusteal-100 transition"
                        >
                          {unit}
                        </a>
                      ))}
                    </div>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setSelectedSubject(null)}
                    >
                      ← Back to Subjects
                    </Button>
                  </>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default sam_4;