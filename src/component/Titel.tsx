interface IProbs {
  text: String;
}
export const Titel = (probs: IProbs): JSX.Element => {
  const { text } = probs;
  return <h1>{text}</h1>;
};
