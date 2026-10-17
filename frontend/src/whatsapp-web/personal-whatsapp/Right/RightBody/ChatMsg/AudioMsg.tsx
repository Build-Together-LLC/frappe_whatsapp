const AudioMsg = ({ mimeType, path }: { mimeType: string; path: string }) => {
  return (
    <div className="tw-w-[250px]">
      <div className="tw-w-full">
        <audio controls>
          <source src={path} type={mimeType || 'audio/mpeg'} />
          Your browser does not support the audio tag.
        </audio>
      </div>
    </div>
  );
};
export default AudioMsg;
