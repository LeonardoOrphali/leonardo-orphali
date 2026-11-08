export function IntroTitle() {
  return (
    <h1 id="intro-title">
      <span className="sr-only">Desenvolvedor Fullstack.</span>
      <span aria-hidden="true">
        {['Desenvolvedor', 'Fullstack.'].map((line, index) => (
          <span key={line}>
            {index > 0 && <br />}
            {Array.from(line).map((character, position) => <span className="typing-character" key={position}>{character}</span>)}
          </span>
        ))}
      </span>
    </h1>
  )
}
