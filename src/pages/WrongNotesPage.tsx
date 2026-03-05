import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PartyPopper, Check, Trash2, ArrowLeft, ChevronDown, ChevronRight, RotateCcw, Eraser, XCircle } from 'lucide-react';
import { useWrongNoteStore } from '../stores';
import { Button } from '../components/Button';
import { WrongNote } from '../types';

interface GroupedWrongNote {
  expression: string;
  answer: number;
  entries: WrongNote[];
  id: string; // For selection
}

interface WrongNoteGroupProps {
  group: GroupedWrongNote;
  onMastered: (entries: WrongNote[]) => void;
  onRemove: (entries: WrongNote[]) => void;
  onUnmarkMastered?: (entries: WrongNote[]) => void;
  showAsMastered?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (groupId: string) => void;
}

const WrongNoteGroup: React.FC<WrongNoteGroupProps> = ({ 
  group, 
  onMastered, 
  onRemove, 
  onUnmarkMastered,
  showAsMastered = false,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const isMultipleErrors = group.entries.length > 1;
  const latestEntry = group.entries[0];
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className={`relative bg-white rounded-2xl p-5 border shadow-sm transition-all ${
        isSelectMode && isSelected 
          ? 'border-indigo-500 ring-2 ring-indigo-200' 
          : showAsMastered 
            ? 'border-gray-200 border-l-4 border-l-emerald-500 opacity-75' 
            : 'border-gray-200 border-l-4 border-l-red-500'
      } ${isSelectMode ? 'cursor-pointer' : ''}`}
      onClick={() => isSelectMode && onToggleSelect && onToggleSelect(group.id)}
    >
      {isSelectMode && (
        <div 
          className="absolute top-4 left-4 w-6 h-6 rounded-full border-2 border-indigo-400 flex items-center justify-center transition-colors z-10 bg-white"
        >
          {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
        </div>
      )}
      <div className={`${isSelectMode ? 'pl-8' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className={`text-xl font-semibold mb-2 ${
              showAsMastered ? 'text-gray-600' : 'text-gray-900'
            }`}>
              {group.expression} = {group.answer}
            </div>
            <div className="flex items-center gap-3 text-sm">
              {isMultipleErrors && (
                <span className={`px-2 py-0.5 rounded-full font-medium ${
                  showAsMastered 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  错误 {group.entries.length} 次
                </span>
              )}
              <span className="text-gray-500">
                最近答案：{latestEntry.userAnswer}
              </span>
              <span className="text-gray-400 text-xs">
                {formatDate(latestEntry.lastWrongDate)}
              </span>
            </div>
          </div>
          
          {!isSelectMode && (
            <div className="flex gap-2">
              {showAsMastered ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onUnmarkMastered && onUnmarkMastered(group.entries)}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> 重新复习
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onRemove(group.entries)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={() => onMastered(group.entries)}>
                    <Check className="w-4 h-4 mr-1" /> 已掌握
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onRemove(group.entries)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        
        {isMultipleErrors && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full"
            >
              {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              查看错误历史 ({group.entries.length}次)
            </button>
            
            {showDetails && (
              <div className="mt-3 space-y-2">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center text-sm bg-red-50 rounded-lg px-3 py-2">
                    <span className="text-red-600 font-medium">答案：{entry.userAnswer}</span>
                    <span className="text-gray-400 text-xs">{formatDate(entry.lastWrongDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const WrongNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { wrongNotes, loadWrongNotes, removeWrongNote, markAsMastered, updateWrongNote, clearAllWrongNotes, removeWrongNotes } = useWrongNoteStore();
  
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<Set<string>>(new Set());
  
  React.useEffect(() => {
    loadWrongNotes();
  }, [loadWrongNotes]);
  
  const handleRemoveGroup = (entries: WrongNote[]) => {
    if (window.confirm(`确定要移除这道题的所有${entries.length}条错误记录吗？`)) {
      entries.forEach(entry => removeWrongNote(entry.id));
    }
  };
  
  const handleMasteredGroup = (entries: WrongNote[]) => {
    entries.forEach(entry => markAsMastered(entry.id));
  };
  
  const handleUnmarkMasteredGroup = (entries: WrongNote[]) => {
    entries.forEach(entry => {
      updateWrongNote(entry.id, { mastered: false, lastWrongDate: new Date().toISOString() });
    });
  };
  
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有错题记录吗？此操作不可恢复！')) {
      clearAllWrongNotes();
    }
  };
  
  const groupedNotes = React.useMemo(() => {
    const groups = new Map<string, GroupedWrongNote>();
    
    wrongNotes.forEach(note => {
      const key = `${note.problem.expression}_${note.problem.answer}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          expression: note.problem.expression,
          answer: note.problem.answer,
          entries: [],
          id: key,
        });
      }
      
      groups.get(key)!.entries.push(note);
    });
    
    groups.forEach(group => {
      group.entries.sort((a, b) => 
        new Date(b.lastWrongDate).getTime() - new Date(a.lastWrongDate).getTime()
      );
    });
    
    return Array.from(groups.values());
  }, [wrongNotes]);
  
  const activeGroups = groupedNotes.filter(g => !g.entries[0].mastered);
  const masteredGroups = groupedNotes.filter(g => g.entries[0].mastered);
  
  const toggleSelect = (groupId: string) => {
    const newSelected = new Set(selectedGroupIds);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroupIds(newSelected);
  };
  
  const selectAll = (groups: GroupedWrongNote[]) => {
    if (selectedGroupIds.size === groups.length) {
      setSelectedGroupIds(new Set());
    } else {
      setSelectedGroupIds(new Set(groups.map(g => g.id)));
    }
  };
  
  const handleBatchDelete = () => {
    if (selectedGroupIds.size === 0) return;
    
    // Collect all entry IDs from selected groups
    const idsToDelete: string[] = [];
    groupedNotes.forEach(group => {
      if (selectedGroupIds.has(group.id)) {
        group.entries.forEach(entry => idsToDelete.push(entry.id));
      }
    });
    
    if (window.confirm(`确定要删除选中的 ${selectedGroupIds.size} 组错题（共 ${idsToDelete.length} 条记录）吗？`)) {
      removeWrongNotes(idsToDelete);
      setSelectedGroupIds(new Set());
      setIsSelectMode(false);
    }
  };
  
  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedGroupIds(new Set());
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" /> 错题本
          </h1>
          <div className="w-16" />
        </div>
        
        {wrongNotes.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            {!isSelectMode ? (
              <>
                <div />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsSelectMode(true)}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Check className="w-4 h-4 mr-1" /> 批量选择
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearAll}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Eraser className="w-4 h-4 mr-1" /> 清空所有
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={exitSelectMode}
                  className="text-gray-600"
                >
                  <XCircle className="w-4 h-4 mr-1" /> 取消
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => selectAll(activeGroups.length > 0 ? activeGroups : masteredGroups)}
                    className="text-gray-600 border-gray-200"
                  >
                    {selectedGroupIds.size === (activeGroups.length > 0 ? activeGroups.length : masteredGroups.length) ? '取消全选' : '全选'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBatchDelete}
                    disabled={selectedGroupIds.size === 0}
                    className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> 删除 ({selectedGroupIds.size})
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        
        {wrongNotes.length === 0 ? (
          <div className="text-center py-12">
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
            <p className="text-gray-600">太棒了！没有错题</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGroups.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  需要复习 ({activeGroups.length})
                </h2>
                <div className="space-y-4">
                  {activeGroups.map((group) => (
                    <WrongNoteGroup
                      key={group.id}
                      group={group}
                      onMastered={handleMasteredGroup}
                      onRemove={handleRemoveGroup}
                      showAsMastered={false}
                      isSelectMode={isSelectMode}
                      isSelected={selectedGroupIds.has(group.id)}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {masteredGroups.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-500 mb-4">
                  已掌握 ({masteredGroups.length})
                </h2>
                <div className="space-y-4">
                  {masteredGroups.map((group) => (
                    <WrongNoteGroup
                      key={group.id}
                      group={group}
                      onMastered={handleMasteredGroup}
                      onRemove={handleRemoveGroup}
                      onUnmarkMastered={handleUnmarkMasteredGroup}
                      showAsMastered={true}
                      isSelectMode={isSelectMode}
                      isSelected={selectedGroupIds.has(group.id)}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};