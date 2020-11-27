interface IProps {
  text: String;
}
export const Titel = (props: IProps) => {
  const { text } = props;
  return <h1>{text}</h1>;
};
