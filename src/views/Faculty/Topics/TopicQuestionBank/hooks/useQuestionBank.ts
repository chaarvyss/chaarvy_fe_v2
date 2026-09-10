import { useState, useEffect } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Medium } from 'src/store/services/admisissionsService'
import {
  useGetQuestionTypesQuery,
  useGetQuestionsQuery,
  useTranslateTextMutation,
  useCreateUpdateQuestionMutation,
  useBulkDeleteQuestionsMutation,
  useBulkUpdateQuestionTypeMutation
} from 'src/store/services/facultyServices'

import { Topic, MarkGroup, Question } from '../types'

export const useQuestionBank = (topic: Topic, mediums?: Medium[]) => {
  const { triggerToast } = useToast()
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

  const [createUpdateQuestion] = useCreateUpdateQuestionMutation()
  const [bulkDeleteQuestions] = useBulkDeleteQuestionsMutation()
  const [bulkUpdateQuestionType] = useBulkUpdateQuestionTypeMutation()
  const [translateText] = useTranslateTextMutation()
  const [markGroups, setMarkGroups] = useState<MarkGroup[]>([])
  const [isTranslating, setIsTranslating] = useState<string | null>(null)
  const [savingQuestionKey, setSavingQuestionKey] = useState<string | null>(null)

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

      setMarkGroups(prev => {
        if (prev.length === 0) {
          return Array.from(groupsMap.values())
        }

        const resultGroups: MarkGroup[] = []
        const usedServerQIds = new Set<string>()

        prev.forEach(prevGroup => {
          const serverGroup = groupsMap.get(prevGroup.id)
          const newQuestions: Question[] = []

          prevGroup.questions.forEach(q => {
            if (q.id) {
              const serverQ = serverGroup?.questions.find(sq => sq.id === q.id)
              if (serverQ) {
                newQuestions.push(serverQ)
                usedServerQIds.add(serverQ.id!)
              } else {
                newQuestions.push(q)
              }
            } else {
              const matchedServerQ = serverGroup?.questions.find(
                sq =>
                  !usedServerQIds.has(sq.id!) &&
                  JSON.stringify(sq.question_title) === JSON.stringify(q.question_title)
              )
              if (matchedServerQ) {
                newQuestions.push(matchedServerQ)
                usedServerQIds.add(matchedServerQ.id!)
              } else {
                newQuestions.push(q)
              }
            }
          })

          serverGroup?.questions.forEach(sq => {
            if (!usedServerQIds.has(sq.id!)) {
              newQuestions.push(sq)
              usedServerQIds.add(sq.id!)
            }
          })

          resultGroups.push({
            ...prevGroup,
            title: serverGroup?.title || prevGroup.title,
            marks: serverGroup?.marks || prevGroup.marks,
            questions: newQuestions
          })
        })

        groupsMap.forEach((serverGroup, gId) => {
          if (!prev.some(pg => pg.id === gId)) {
            resultGroups.push(serverGroup)
          }
        })

        return resultGroups
      })
    }
  }, [questions, questionTypes])

  const [isGroupModalOpen, setGroupModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [groupID, setgroupID] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'group'; id: string } | { type: 'question'; groupId: string; qIndex: number } | null
  >(null)

  const confirmDelete = async () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'group') {
      const targetGroup = markGroups.find(mg => mg.id === deleteTarget.id)
      const savedQuestionIds = targetGroup?.questions.filter(q => q.id).map(q => q.id!) || []

      try {
        if (savedQuestionIds.length > 0) {
          await bulkDeleteQuestions({ question_ids: savedQuestionIds }).unwrap()
        }
        deleteMarkGroup(deleteTarget.id)
        triggerToast('Mark group and its questions deleted successfully', {
          variant: ToastVariants.SUCCESS
        })
      } catch (err: any) {
        console.error('Failed to delete mark group:', err)
        triggerToast(err?.data?.message || err?.message || 'Failed to delete mark group', {
          variant: ToastVariants.ERROR
        })
      }
    } else {
      const targetGroup = markGroups.find(mg => mg.id === deleteTarget.groupId)
      const targetQuestion = targetGroup?.questions[deleteTarget.qIndex]

      try {
        if (targetQuestion?.id) {
          await bulkDeleteQuestions({ question_ids: [targetQuestion.id] }).unwrap()
        }
        deleteQuestion(deleteTarget.groupId, deleteTarget.qIndex)
        triggerToast('Question deleted successfully', {
          variant: ToastVariants.SUCCESS
        })
      } catch (err: any) {
        console.error('Failed to delete question:', err)
        triggerToast(err?.data?.message || err?.message || 'Failed to delete question', {
          variant: ToastVariants.ERROR
        })
      }
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

  const handleSaveGroup = async () => {
    if (!groupID.trim() || !questionTypes) return

    const questionType = questionTypes.find(each => each.id === groupID)
    if (!questionType) return

    if (editingGroupId) {
      if (editingGroupId === groupID) {
        setGroupModalOpen(false)
        setEditingGroupId(null)
        setgroupID('')
        return
      }

      const oldGroup = markGroups.find(mg => mg.id === editingGroupId)
      const savedQuestionIds = oldGroup?.questions.filter(q => q.id).map(q => q.id!) || []

      try {
        if (savedQuestionIds.length > 0) {
          await bulkUpdateQuestionType({ question_ids: savedQuestionIds, question_type: groupID }).unwrap()
        }

        setMarkGroups(prev => {
          const currentOldGroup = prev.find(mg => mg.id === editingGroupId)
          if (!currentOldGroup) return prev

          const updatedQuestions = currentOldGroup.questions.map(q => ({
            ...q,
            question_type: groupID
          }))

          const existingTargetGroup = prev.find(mg => mg.id === groupID)

          if (existingTargetGroup) {
            return prev
              .filter(mg => mg.id !== editingGroupId)
              .map(mg =>
                mg.id === groupID
                  ? { ...mg, questions: [...mg.questions, ...updatedQuestions] }
                  : mg
              )
          } else {
            return prev.map(mg =>
              mg.id === editingGroupId
                ? {
                    ...mg,
                    id: groupID,
                    title: questionType.question_type ?? '',
                    marks: questionType.marks ?? 1,
                    questions: updatedQuestions
                  }
                : mg
            )
          }
        })

        triggerToast('Mark group updated successfully', {
          variant: ToastVariants.SUCCESS
        })
      } catch (err: any) {
        console.error('Failed to update group question type:', err)
        triggerToast(err?.data?.message || err?.message || 'Failed to update group', {
          variant: ToastVariants.ERROR
        })
      }
    } else {
      if (!markGroups.find(mg => mg.id === groupID)) {
        setMarkGroups(prev => [
          ...prev,
          {
            id: groupID,
            title: questionType.question_type ?? '',
            marks: questionType.marks ?? 1,
            questions: []
          }
        ])
        triggerToast('Mark group added successfully', {
          variant: ToastVariants.SUCCESS
        })
      } else {
        triggerToast('Mark group already exists', {
          variant: ToastVariants.INFO
        })
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
          if (res) {
            Object.entries(res).forEach(([lang, translatedText]) => {
              updateQuestionTitle(groupId, qIndex, lang, translatedText)
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

              if (res) {
                const responseData = res as Record<string, string>
                Object.entries(responseData).forEach(([lang, translatedText]) => {
                  updateQuestionOption(groupId, qIndex, lang, i, translatedText)
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

  const handleSaveQuestion = async (groupId: string, qIndex: number) => {
    const group = markGroups.find(mg => mg.id === groupId)
    if (!group) return
    const q = group.questions[qIndex]
    if (!q) return

    const englishTitle = q.question_title?.[englishMediumId]?.trim()
    const hasAnyTitle = Object.values(q.question_title || {}).some(t => t?.trim())
    if (!englishTitle && !hasAnyTitle) {
      triggerToast('Please provide a question title before saving', {
        variant: ToastVariants.ERROR
      })
      return
    }

    if (q.ui_type === 'mcq') {
      const englishOpts = q.options?.[englishMediumId] || []
      const hasEmptyOpt = englishOpts.some(opt => !opt?.trim())
      if (englishOpts.length < 4 || hasEmptyOpt) {
        triggerToast('Please fill all 4 options for the question', {
          variant: ToastVariants.ERROR
        })
        return
      }

      const englishAnswer = q.correct_option?.[englishMediumId]?.trim()
      if (!englishAnswer) {
        triggerToast('Please select a correct answer for the question', {
          variant: ToastVariants.ERROR
        })
        return
      }
    }

    const saveKey = `${groupId}-${qIndex}`
    setSavingQuestionKey(saveKey)

    try {
      const payload = {
        question_id: q.id || undefined,
        program_id: topic.program,
        segment_id: topic.segment,
        subject_id: topic.subject,
        topic_id: topic.topic_id,
        question_type: groupId,
        question_title: q.question_title,
        options: q.ui_type === 'mcq' ? q.options : null,
        correct_option: q.ui_type === 'mcq' ? q.correct_option : null
      }

      const res = await createUpdateQuestion(payload).unwrap()
      triggerToast(res?.message || (q.id ? 'Question updated successfully' : 'Question created successfully'), {
        variant: ToastVariants.SUCCESS
      })
    } catch (err: any) {
      console.error('Failed to save question:', err)
      triggerToast(err?.data?.message || err?.message || 'Failed to save question', {
        variant: ToastVariants.ERROR
      })
    } finally {
      setSavingQuestionKey(null)
    }
  }

  const isSavingQuestion = (groupId: string, qIndex: number) => savingQuestionKey === `${groupId}-${qIndex}`

  return {
    markGroups,
    questionTypes,
    isTranslating,
    savingQuestionKey,
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
      handleTranslateQuestion,
      handleSaveQuestion,
      isSavingQuestion
    }
  }
}
