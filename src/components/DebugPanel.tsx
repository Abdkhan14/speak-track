import styled from 'styled-components'

interface Match {
  index: number
  score: number
}

interface DebugPanelProps {
  currentIndex: number
  lastHeard: string
  matches: Match[]
  matchCursor: number
  mode: string
  embedStatus: string
  findQuery: string
  onFindChange: (value: string) => void
  onFind: () => void
  finding: boolean
  onPrev: () => void
  onNext: () => void
  onSimulateNext: () => void
  lostCount: number
}

const Panel = styled.div`
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 0.6rem 1.25rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #374151;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  align-items: center;
`

const Field = styled.span`
  white-space: nowrap;
`

const Btn = styled.button`
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 3px;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const FindRow = styled.div`
  width: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const FindInput = styled.input`
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: #9ca3af;
  }
`

export default function DebugPanel({
  currentIndex,
  lastHeard,
  matches,
  matchCursor,
  mode,
  embedStatus,
  findQuery,
  onFindChange,
  onFind,
  finding,
  onPrev,
  onNext,
  onSimulateNext,
  lostCount,
}: DebugPanelProps) {
  const matchList =
    matches.length > 0
      ? matches.map((m) => `i=${m.index} ${m.score.toFixed(2)}`).join('  ')
      : '—'

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onFind()
  }

  return (
    <Panel>
      <Field>index: {currentIndex}</Field>
      <Field>heard: {lastHeard || '—'}</Field>
      <Field>mode: {mode}</Field>
      <Field>
        rank: {matchCursor + 1} / {matches.length || '—'}
      </Field>
      <Field>embed: {embedStatus}</Field>
      <Field>lost: {lostCount}</Field>
      <Field>matches: {matchList}</Field>
      <Btn onClick={onPrev}>Prev</Btn>
      <Btn onClick={onNext}>Next</Btn>
      <Btn onClick={onSimulateNext}>Simulate next</Btn>
      <FindRow>
        <FindInput
          value={findQuery}
          onChange={(e) => onFindChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="what did I just say?"
        />
        <Btn
          onClick={onFind}
          disabled={finding || !findQuery.trim()}
        >
          {finding ? 'Finding...' : 'Find in script'}
        </Btn>
      </FindRow>
    </Panel>
  )
}
