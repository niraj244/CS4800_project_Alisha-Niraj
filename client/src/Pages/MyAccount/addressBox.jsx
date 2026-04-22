import { useContext, useRef, useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { MyContext } from '../../App';

export default function AddressBox({ address, removeAddress }) {
  const context = useContext(MyContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const editAddress = (id) => {
    setOpen(false);
    context?.setOpenAddressPanel(true);
    context?.setAddressMode('edit');
    context?.setAddressId(id);
  };

  return (
    <div className="relative border border-dashed border-border bg-surface-alt p-4 rounded-xl cursor-pointer">
      <span className="inline-block px-2 py-0.5 bg-border text-xs rounded font-medium">{address?.addressType}</span>
      <p className="mt-2 text-sm font-semibold flex items-center gap-3">
        <span>{context?.userData?.name}</span>
        <span className="text-text-muted font-normal">{address?.mobile}</span>
      </p>
      <p className="text-xs text-text-muted mt-0.5">
        {[address?.address_line1, address?.city, address?.state, address?.country, address?.pincode].filter(Boolean).join(', ')}
      </p>

      <div className="absolute top-3 right-3">
        <button ref={ref} onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded-full hover:bg-border transition-colors text-text-muted">
          <HiOutlineDotsVertical size={16} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-8 z-20 bg-white border border-border rounded-lg shadow-md py-1 w-32 text-sm">
              <button onClick={() => editAddress(address?._id)}
                className="w-full text-left px-4 py-2 hover:bg-surface-alt">Edit</button>
              <button onClick={() => { setOpen(false); removeAddress(address?._id); }}
                className="w-full text-left px-4 py-2 hover:bg-surface-alt text-danger">Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
