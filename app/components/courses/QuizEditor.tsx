import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";

interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correctAnswers: number[];
}

interface QuizEditorProps {
  _courseId?: string;
  initialQuiz?: {
    id?: number;
    question: string;
    options: string[];
    correctAnswers: number[];
  };
  onQuizChange: (quiz: QuizQuestion) => void;
}

export default function QuizEditor({
  initialQuiz,
  onQuizChange,
}: QuizEditorProps) {
  const [quiz, setQuiz] = useState<QuizQuestion>(initialQuiz || {
    question: '',
    options: ['', ''],
    correctAnswers: [],
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...quiz.options];
    newOptions[index] = value;
    const newQuiz = { ...quiz, options: newOptions };
    setQuiz(newQuiz);
    onQuizChange(newQuiz);
  };

  const handleCorrectAnswerToggle = (index: number) => {
    const newCorrectAnswers = quiz.correctAnswers.includes(index)
      ? quiz.correctAnswers.filter(i => i !== index)
      : [...quiz.correctAnswers, index];
    const newQuiz = { ...quiz, correctAnswers: newCorrectAnswers };
    setQuiz(newQuiz);
    onQuizChange(newQuiz);
  };

  const addOption = () => {
    setQuiz({
      ...quiz,
      options: [...quiz.options, '']
    });
  };

  const removeOption = (index: number) => {
    const newOptions = quiz.options.filter((_, i) => i !== index);
    const newCorrectAnswers = quiz.correctAnswers
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    const newQuiz = {
      ...quiz,
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    };
    setQuiz(newQuiz);
    onQuizChange(newQuiz);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Éditer le quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Question</Label>
          <Input
            value={quiz.question}
            onChange={(e) => {
              const newQuiz = { ...quiz, question: e.target.value };
              setQuiz(newQuiz);
              onQuizChange(newQuiz);
            }}
            placeholder="Enter your question"
          />
        </div>

        <div className="space-y-4">
          <Label>Options</Label>
          {quiz.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Checkbox
                checked={quiz.correctAnswers.includes(index)}
                onCheckedChange={() => handleCorrectAnswerToggle(index)}
              />
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {quiz.options.length > 2 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
          >
            Ajouter une option
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 