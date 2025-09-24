interface RemarksProps {
  teacher: string;
  principal: string;
}

const Remarks = ({ teacher, principal }: RemarksProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">Remarks</h3>
      <div className="border p-4 rounded-md space-y-2">
        <div>
          <p className="font-semibold">Teacher's Remark:</p>
          <p className="italic">"{teacher}"</p>
        </div>
        <div>
          <p className="font-semibold">Principal's Remark:</p>
          <p className="italic">"{principal}"</p>
        </div>
      </div>
    </div>
  );
};

export default Remarks;
