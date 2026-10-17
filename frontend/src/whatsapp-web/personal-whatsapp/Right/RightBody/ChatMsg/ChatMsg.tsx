export function getUrlOrText(input: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = input.split('\n');

  return (
    <div className="tw-text-[15px] tw-break-words tw-p-0 tw-m-0">
      {lines.map((line, index) => {
        const parts = line.split(urlRegex);
        return (
          <div key={index} className="tw-mb-[5px]">
            {parts.map((part, i) =>
              urlRegex.test(part) ? (
                <a
                  href={part}
                  className="tw-text-[#007bff]"
                  target="_blank"
                  rel="noopener noreferrer"
                  key={i}
                >
                  {part}
                </a>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

const phoneToName = (number: string): string => {
  return number;
};

const ChatMsg = ({ messageBody }: { messageBody: string }) => {
  let modifiedMessage: string = messageBody;
  const phoneNumberRegex = /@(\d{10,15})/g;
  const phoneNumberMatch = messageBody.match(phoneNumberRegex);
  if (phoneNumberMatch) {
    phoneNumberMatch.forEach((match) => {
      const phoneNumber = match.slice(1);
      const name = phoneToName(phoneNumber);
      modifiedMessage = modifiedMessage.replace(match, `@${name}`);
    });
  }
  return <div>{getUrlOrText(modifiedMessage)}</div>;
};
export default ChatMsg;
