import { useState, useEffect } from 'react'

import { Medium } from 'src/store/services/admisissionsService'
import {
  useGetQuestionTypesQuery,
  useGetQuestionsQuery,
  useTranslateTextMutation
} from 'src/store/services/facultyServices'

import { Topic, MarkGroup, Question } from '../types'

export const useQuestionBank = (topic: Topic, mediums?: Medium[]) => {
  const { data: questionTypes } = useGetQuestionTypesQuery()

  const { data: questions } = useGetQuestionsQuery(
    {
      program_id: topic.program,
      segment_id: topic.segment,
      subject_id: topic.subject,
      topic_id: topic.topic_id
    },
    {
      skip: !topic.program || !topic.segment || !topic.subject || !topic.topic_id
    }
  )

  const [translateText] = useTranslateTextMutation()
  const [markGroups, setMarkGroups] = useState<MarkGroup[]>([])
  const [isTranslating, setIsTranslating] = useState<string | null>(null)

  useEffect(() => {
    const questionList = Array.isArray(questions)
      ? questions
      : (questions as any)?.data || (questions as any)?.questions

    if (questionList && Array.isArray(questionList)) {
      const groupsMap = new Map<string, MarkGroup>()

      questionList.forEach((q: any) => {
        const qTypeInfo = questionTypes ? questionTypes.find((qt: any) => qt.id === q.question_type) : null

        if (!groupsMap.has(q.question_type)) {
          groupsMap.set(q.question_type, {
            id: q.question_type,
            title: qTypeInfo?.question_type || 'Unknown Type',
            marks: qTypeInfo?.marks || 1,
            questions: []
          })
        }

        groupsMap.get(q.question_type)?.questions.push({
          ...q,
          ui_type: q.options && Object.keys(q.options).length > 0 ? 'mcq' : 'theory'
        })
      })

      setMarkGroups(Array.from(groupsMap.values()))
    }
  }, [questions, questionTypes])

  const [isGroupModalOpen, setGroupModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [groupID, setgroupID] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'group'; id: string } | { type: 'question'; groupId: string; qIndex: number } | null
  >(null)

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'group') {
      deleteMarkGroup(deleteTarget.id)
    } else {
      deleteQuestion(deleteTarget.groupId, deleteTarget.qIndex)
    }
    setDeleteTarget(null)
  }

  const handleOpenGroupModal = (group?: MarkGroup) => {
    if (group) {
      setEditingGroupId(group.id)
      setgroupID(group.id)
    } else {
      setEditingGroupId(null)
      setgroupID('')
    }
    setGroupModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!groupID.trim() || !questionTypes) return

    const questionType = questionTypes.find(each => each.id === groupID)

    if (editingGroupId) {
      setMarkGroups(prev =>
        prev.map(mg =>
          mg.id === editingGroupId
            ? { ...mg, title: questionType?.question_type ?? '', marks: questionType?.marks ?? 1 }
            : mg
        )
      )
    } else {
      if (!markGroups.find(mg => mg.id === groupID)) {
        setMarkGroups(prev => [
          ...prev,
          {
            id: groupID,
            title: questionType?.question_type ?? '',
            marks: questionType?.marks ?? 1,
            questions: []
          }
        ])
      }
    }

    setgroupID('')
    setEditingGroupId(null)
    setGroupModalOpen(false)
  }

  const deleteMarkGroup = (id: string) => {
    setMarkGroups(prev => prev.filter(mg => mg.id !== id))
  }

  const addQuestion = (groupId: string, type: 'mcq' | 'theory') => {
    setMarkGroups(prev =>
      prev.map(mg => {
        if (mg.id === groupId) {
          const newQ: Question = {
            topic_id: topic.topic_id,
            question_type: groupId,
            question_title: {},
            ui_type: type,
            ...(type === 'mcq' ? { options: {}, correct_option: {} } : {})
          }

          mediums?.forEach(m => {
            newQ.question_title[m.medium_id] = ''
            if (type === 'mcq') {
              newQ.options![m.medium_id] = ['', '', '', '']
              newQ.correct_option![m.medium_id] = ''
            }
          })

          return { ...mg, questions: [...mg.questions, newQ] }
        }

        return mg
      })
    )
  }

  const deleteQuestion = (groupId: string, qIndex: number) => {
    setMarkGroups(prev =>
      prev.map(mg => {
        if (mg.id === groupId) {
          return { ...mg, questions: mg.questions.filter((_, idx) => idx !== qIndex) }
        }

        return mg
      })
    )
  }

  const updateQuestionTitle = (groupId: string, qIndex: number, mediumId: string, val: string) => {
    setMarkGroups(prev =>
      prev.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map((q, idx) => {
              if (idx === qIndex) {
                return { ...q, question_title: { ...q.question_title, [mediumId]: val } }
              }

              return q
            })
          }
        }

        return mg
      })
    )
  }

  const updateQuestionOption = (groupId: string, qIndex: number, mediumId: string, optIndex: number, val: string) => {
    setMarkGroups(prev =>
      prev.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map((q, idx) => {
              if (idx === qIndex) {
                const newOpts = { ...(q.options || {}) }
                const arr = [...(newOpts[mediumId] || ['', '', '', ''])]
                arr[optIndex] = val
                newOpts[mediumId] = arr

                return { ...q, options: newOpts }
              }

              return q
            })
          }
        }

        return mg
      })
    )
  }

  const updateQuestionAnswer = (groupId: string, qIndex: number, mediumId: string, val: string) => {
    setMarkGroups(prev =>
      prev.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map((q, idx) => {
              if (idx === qIndex) {
                return { ...q, correct_option: { ...q.correct_option, [mediumId]: val } }
              }

              return q
            })
          }
        }

        return mg
      })
    )
  }

  const englishMediumId =
    mediums?.find(m => m.medium_name?.toLowerCase() === 'english' || m.medium_id === 'english')?.medium_id || 'english'

  const handleTranslateQuestion = async (groupId: string, qIndex: number, question: Question) => {
    setIsTranslating(`${groupId}-${qIndex}`)
    try {
      const englishText = question.question_title[englishMediumId]
      const targetMediums = mediums?.filter(m => m.medium_id !== englishMediumId).map(m => m.medium_id) || []

      if (targetMediums.length === 0) return

      if (englishText) {
        try {
          const res = await translateText({ text: englishText, target_languages: targetMediums }).unwrap()
          if (res?.translations) {
            Object.entries(res.translations).forEach(([lang, translatedText]) => {
              updateQuestionTitle(groupId, qIndex, lang, translatedText as string)
            })
          }
        } catch (e) {
          console.error('Failed to translate title:', e)
        }
      }

      if (question.ui_type === 'mcq' && question.options?.[englishMediumId]) {
        const englishOptions = question.options[englishMediumId]
        for (let i = 0; i < englishOptions.length; i++) {
          if (englishOptions[i]) {
            try {
              const res = await translateText({ text: englishOptions[i], target_languages: targetMediums }).unwrap()
              if (res?.translations) {
                Object.entries(res.translations).forEach(([lang, translatedText]) => {
                  updateQuestionOption(groupId, qIndex, lang, i, translatedText as string)
                })
              }
            } catch (e) {
              console.error(`Failed to translate option ${i + 1}:`, e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Translation failed', error)
    } finally {
      setIsTranslating(null)
    }
  }

  return {
    markGroups,
    questionTypes,
    isTranslating,
    englishMediumId,
    modalState: {
      isGroupModalOpen,
      setGroupModalOpen,
      editingGroupId,
      groupID,
      setgroupID,
      deleteTarget,
      setDeleteTarget
    },
    handlers: {
      confirmDelete,
      handleOpenGroupModal,
      handleSaveGroup,
      addQuestion,
      updateQuestionTitle,
      updateQuestionOption,
      updateQuestionAnswer,
      handleTranslateQuestion
    }
  }
}
