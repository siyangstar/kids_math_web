import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  PartyPopper,
  BookOpen,
  RefreshCw,
  Home,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "../components/Button";
import { useQuizStore, useWrongNoteStore } from "../stores";
import { getSessionHistory } from "../utils/storage";
import { SessionResult } from "../types";

const STAR_CONFIGS = [
  { left: "10%", delay: "0s", dur: "1.2s", size: 24 },
  { left: "25%", delay: "0.2s", dur: "1.0s", size: 20 },
  { left: "40%", delay: "0.1s", dur: "1.4s", size: 28 },
  { left: "60%", delay: "0.3s", dur: "1.1s", size: 22 },
  { left: "75%", delay: "0.05s", dur: "1.3s", size: 18 },
  { left: "88%", delay: "0.25s", dur: "1.0s", size: 26 },
];

const CONFETTI_CONFIGS = [
  { left: "5%", delay: "0s", dur: "1.2s", color: "#F59E0B", rotate: 45 },
  { left: "20%", delay: "0.15s", dur: "1.0s", color: "#6366F1", rotate: -30 },
  { left: "35%", delay: "0.05s", dur: "1.3s", color: "#10B981", rotate: 60 },
  { left: "50%", delay: "0.25s", dur: "1.1s", color: "#EF4444", rotate: -60 },
  { left: "65%", delay: "0.1s", dur: "1.4s", color: "#A855F7", rotate: 30 },
  { left: "80%", delay: "0.2s", dur: "1.0s", color: "#F59E0B", rotate: -45 },
  { left: "92%", delay: "0.08s", dur: "1.2s", color: "#6366F1", rotate: 15 },
];

const CelebrationOverlay: React.FC<{ score: number }> = ({ score }) => {
  const showConfetti = score === 100;
  const showStars = score >= 80;
  if (!showStars) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
      {STAR_CONFIGS.map((cfg, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "15%",
            left: cfg.left,
            fontSize: cfg.size,
            animation: `floatUp ${cfg.dur} ${cfg.delay} ease-out forwards`,
          }}
        >
          ⭐
        </div>
      ))}
      {showConfetti &&
        CONFETTI_CONFIGS.map((cfg, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "5%",
              left: cfg.left,
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: cfg.color,
              animation: `confettiFall ${cfg.dur} ${cfg.delay} ease-in forwards`,
              transform: `rotate(${cfg.rotate}deg)`,
            }}
          />
        ))}
    </div>
  );
};

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markAsMastered } = useWrongNoteStore();
  const { problems, answers, resetQuiz, startQuiz } = useQuizStore();
  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const routeState = location.state as {
    isWrongNotePractice?: boolean;
    result?: SessionResult;
    resultId?: string;
    pendingMasteredNoteIds?: string[];
  } | null;
  const isWrongNotePractice = Boolean(
    routeState?.isWrongNotePractice ||
    searchParams.get("mode") === "wrong-note",
  );
  const sessionResult = React.useMemo(() => {
    if (routeState?.result) return routeState.result;
    const resultId = routeState?.resultId ?? searchParams.get("resultId");
    if (!resultId) return null;
    return getSessionHistory().find((item) => item.id === resultId) ?? null;
  }, [routeState, searchParams]);
  const pendingMasteredNoteIds = routeState?.pendingMasteredNoteIds ?? [];
  const resultProblems = sessionResult?.problems ?? problems;
  const resultAnswers = sessionResult?.answers ?? answers;

  React.useEffect(() => {
    if (!isWrongNotePractice || pendingMasteredNoteIds.length === 0) return;

    pendingMasteredNoteIds.forEach((id) => markAsMastered(id));
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {
        ...routeState,
        pendingMasteredNoteIds: [],
      },
    });
  }, [
    isWrongNotePractice,
    pendingMasteredNoteIds,
    markAsMastered,
    navigate,
    location.pathname,
    location.search,
    routeState,
  ]);

  React.useEffect(() => {
    if (sessionResult || resultProblems.length > 0 || resultAnswers.length > 0)
      return;
    navigate("/", { replace: true });
  }, [sessionResult, resultProblems.length, resultAnswers.length, navigate]);

  const correctCount =
    sessionResult?.correctCount ??
    resultAnswers.filter((a) => a.isCorrect).length;
  const totalCount = resultProblems.length;
  const score =
    sessionResult?.score ??
    (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);

  const handleTryAgain = () => {
    if (isWrongNotePractice) {
      navigate("/wrong-note-practice");
      return;
    }

    resetQuiz();
    startQuiz();
    navigate("/quiz");
  };

  const handleGoHome = () => {
    resetQuiz();
    navigate("/");
  };

  const allAnswerDetails = resultAnswers
    .map((answer, index) => ({ answer, problem: resultProblems[index] }))
    .filter(({ problem }) => problem != null);
  const wrongAnswers = allAnswerDetails.filter(
    ({ answer }) => !answer.isCorrect,
  );
  const correctAnswers = allAnswerDetails.filter(
    ({ answer }) => answer.isCorrect,
  );

  const getResultMessage = () => {
    const accuracy =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    if (accuracy === 100)
      return {
        title: "太棒了！全对！",
        subtitle: "你是数学天才！",
        icon: Trophy,
        color: "text-[var(--color-secondary)]",
      };
    if (accuracy >= 80)
      return {
        title: "做得很好！",
        subtitle: "继续保持！",
        icon: PartyPopper,
        color: "text-[var(--color-primary)]",
      };
    if (accuracy >= 60)
      return {
        title: "继续加油！",
        subtitle: "还有进步空间",
        icon: BookOpen,
        color: "text-[var(--color-text-secondary)]",
      };
    return {
      title: "再接再厉！",
      subtitle: "多多练习就会进步",
      icon: BookOpen,
      color: "text-[var(--color-text-secondary)]",
    };
  };

  const resultMessage = getResultMessage();
  const ResultIcon = resultMessage.icon;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-4 sm:p-6">
      <CelebrationOverlay score={score} />
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 relative z-20">
        {/* Header */}
        <div className="text-center py-3 sm:py-4">
          <ResultIcon
            className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 ${resultMessage.color} ${score === 100 ? "animate-bounce-pop" : ""}`}
          />
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
            {resultMessage.title}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
            {resultMessage.subtitle}
          </p>
        </div>

        {/* Score display */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-3 sm:mb-4">
            <span className="text-5xl sm:text-6xl font-bold text-[var(--color-primary)]">
              {score}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
              分
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-2 sm:p-3 bg-[var(--color-bg-secondary)] rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                {totalCount}
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                总题数
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-success)]">
                {correctCount}
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--color-success)]">
                正确
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-red-50 rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[var(--color-error)]">
                {totalCount - correctCount}
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--color-error)]">
                错误
              </div>
            </div>
          </div>
        </div>

        {/* Wrong answers with correct answer shown */}
        {wrongAnswers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2 sm:mb-3 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-error)]" />{" "}
              答错的题
            </h2>
            <div className="space-y-2">
              {wrongAnswers.map(({ problem, answer }, index) => (
                <div
                  key={index}
                  className="p-2.5 sm:p-3 bg-red-50 rounded-xl border-l-4 border-[var(--color-error)] text-sm sm:text-base"
                >
                  <div className="font-semibold text-[var(--color-text-primary)] mb-1">
                    {problem.expression} = ?
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[var(--color-error)]">
                      你答：<strong>{answer.userAnswer}</strong>
                    </span>
                    <span className="text-[var(--color-success)]">
                      正确：<strong>{problem.answer}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correct answers */}
        {correctAnswers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2 sm:mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-success)]" />{" "}
              答对的题
            </h2>
            <div className="flex flex-wrap gap-2">
              {correctAnswers.map(({ problem }, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-[var(--color-success)]"
                >
                  {problem.expression} = {problem.answer}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleTryAgain}
            className="flex-1 text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
            {isWrongNotePractice ? "继续错题强化" : "再来一组"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoHome}
            className="flex-1 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 返回首页
          </Button>
        </div>
      </div>
    </div>
  );
};
