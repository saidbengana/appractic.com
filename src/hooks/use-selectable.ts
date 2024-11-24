import { useState, useCallback, useMemo } from 'react'

export const useSelectable = () => {
  const [pageRecords, setPageRecords] = useState<string[]>([])
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])

  const isRecordSelected = useCallback((key: string) => {
    return selectedRecords.includes(key)
  }, [selectedRecords])

  const areRecordsSelected = useCallback((keys: string[]) => {
    if (!keys.length) {
      return false
    }
    return keys.every(key => isRecordSelected(key))
  }, [isRecordSelected])

  const selectRecords = useCallback((keys: string[]) => {
    setSelectedRecords(prev => {
      const newRecords = [...prev]
      for (const key of keys) {
        if (!newRecords.includes(key)) {
          newRecords.push(key)
        }
      }
      return newRecords
    })
  }, [])

  const deselectRecord = useCallback((key: string) => {
    setSelectedRecords(prev => {
      const index = prev.indexOf(key)
      if (index !== -1) {
        const newRecords = [...prev]
        newRecords.splice(index, 1)
        return newRecords
      }
      return prev
    })
  }, [])

  const deselectRecords = useCallback((keys: string[]) => {
    for (const key of keys) {
      deselectRecord(key)
    }
  }, [deselectRecord])

  const deselectAllRecords = useCallback(() => {
    setSelectedRecords([])
  }, [])

  const putPageRecords = useCallback((keys: string[]) => {
    setPageRecords(keys)
  }, [])

  const toggleSelectRecordsOnPage = useCallback(() => {
    if (areRecordsSelected(pageRecords)) {
      deselectRecords(pageRecords)
    } else {
      selectRecords(pageRecords)
    }
  }, [pageRecords, areRecordsSelected, deselectRecords, selectRecords])

  return {
    selectedRecords,
    toggleSelectRecordsOnPage,
    putPageRecords,
    selectRecords,
    deselectRecord,
    deselectAllRecords,
    isRecordSelected,
    areRecordsSelected,
  }
}
