
// import React, { useContext, useState } from 'react';
// import { crudsContext } from '../context/CrudsContextProvider';
// import { Link } from 'react-router-dom';

// export default function MyArtworks() {
//     const { list, setlist, biddingWinner } = useContext(crudsContext);






//     const [editingIndex, setEditingIndex] = useState(null); 
//     const [newAuctionEndTime, setNewAuctionEndTime] = useState('');

//     function handleDelete(index) {
//         let dataParsed = JSON.parse(localStorage.getItem('artworks')) || [];

//         dataParsed.splice(index, 1);
//         localStorage.setItem('artworks', JSON.stringify(dataParsed));

//         setlist(dataParsed);
//     }

//     function handleSaveAuctionTime(index) {
//         const updatedList = [...list];



//         updatedList[index].auctionEndTime = newAuctionEndTime;

//         setlist(updatedList);



//         localStorage.setItem('artworks', JSON.stringify(updatedList));

//         setEditingIndex(null); 



//         setNewAuctionEndTime(''); 
//     }

//     const today = new Date();
//     const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

//     return (
//         <>
//             <div className="p-10 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] h-fit">
//                 <h1 className="text-2xl font-bold text-[#D1A58F] mb-10">My Artworks</h1>

//                 <div className="relative overflow-x-auto shadow-lg sm:rounded-lg">
//                     <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//                         <thead className="text-md text-gray-700 dark:text-gray-400">
//                             <tr>
//                             <th scope="col" className="px-6 py-3  dark:bg-gray-800">Status</th>
//                                 <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Title</th>
//                                 <th scope="col" className="px-6 py-3 w-50">Bidding Winner</th>
//                                 <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Category</th>
//                                 <th scope="col" className="px-6 py-3">Initial Price</th>
//                                 <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Auction Start Time</th>
//                                 <th scope="col" className="px-6 py-3">Auction End Time</th> 
//                                 <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Actions</th>
//                             </tr>
//                         </thead>


//          <tbody>



//     {list.length === 0 ? (
//         <tr>
//             <td colSpan={7} className="text-black p-20 text-center font-semibold text-md">No Artworks</td>
//         </tr>
//     ) : (
//         list?.map((current, index) => {
//             const auctionEndDate = new Date(current.auctionEndTime);
//             const hasAuctionEnded = auctionEndDate < todayDateOnly;

//             return (
//                 <tr className="border-b border-gray-200 dark:border-gray-700" key={index}>

//                 <td className="px-6 py-4  dark:bg-gray-800">{current.status || 'Pending'}</td> 

//                     <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800">{current.title}</td>
//                     <td className="px-6 py-4">
//                         {hasAuctionEnded? biddingWinner || 'Auction ended. Winner not announced yet.': 'The winner will be announced after the auction ends.'}

//                     </td>
//                     <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800">{current.category}</td>


//                     <td className="px-6 py-4">{current.initialPrice}</td>
//                     <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800">{current.auctionStartTime}</td>
//                     <td className="px-6 py-4">
//                         {editingIndex === index ? (
//                             <input type="date" value={newAuctionEndTime} onChange={(e) => setNewAuctionEndTime(e.target.value)}className="border rounded px-2 py-1"/>
//                         ) : (
//                             current.auctionEndTime
//                         )}
//                     </td>
//                     <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-center">
//                         <button className="p-3 bg-[#0a115f] mr-2 text-white rounded-lg hover:bg-blue-900 cursor-pointer duration-300" onClick={() => handleDelete(index)}>
//                             Delete
//                         </button>
//                         {hasAuctionEnded ? (
//                             editingIndex === index ? (
//                                 <button className="mt-2 p-3 bg-[#D1A58F] text-white rounded-lg hover:bg-[#c0927b] duration-300 cursor-pointer" onClick={() => handleSaveAuctionTime(index)}>Save</button>
//                             ) : (
//                                 <button className="mt-2 p-3 bg-[#D1A58F] text-white rounded-lg hover:bg-[#c0927b] duration-300 cursor-pointer" onClick={() => {setEditingIndex(index);setNewAuctionEndTime(current.auctionEndTime);}}> Extend Auction Time</button>
//                             )
//                         ) : (
//                             <Link state={{ artwork: current, index, photo: current.photo }} to={'/ArtistDashboard/EditArtwork'} className="p-3 bg-[#D1A58F] text-white rounded-lg hover:bg-[#c0927b] duration-300 cursor-pointer" > Edit</Link>
//                         )}
//                     </td>
//                 </tr>
//         );
//  })
//     )}
// </tbody>


//                     </table>
//                 </div>
//             </div>
//         </>
//     );
// }






import React, { useContext, useState, useEffect } from 'react';
import { crudsContext } from '../context/CrudsContextProvider';
import { Link } from 'react-router-dom';

export default function MyArtworks() {
    const { list, setlist, biddingWinner } = useContext(crudsContext);

    const [editingIndex, setEditingIndex] = useState(null); 
    const [newAuctionEndTime, setNewAuctionEndTime] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await fetch('/api/artworks');
                const data = await response.json();
                setlist(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching artworks:', error);
                setLoading(false);
            }
        };
        fetchArtworks();
    }, [setlist]);

    const handleDelete = async (index) => {
        const artwork = list[index];
        try {
            const response = await fetch(`/api/artworks/${artwork.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const updatedList = list.filter((_, i) => i !== index);
                setlist(updatedList);
            } else {
                console.error('Error deleting artwork:', response.status);
            }
        } catch (error) {
            console.error('Error deleting artwork:', error);
        }
    };

    const handleSaveAuctionTime = async (index) => {
        const updatedList = [...list];
        updatedList[index].auctionEndTime = newAuctionEndTime;

        try {
            const response = await fetch(`/api/artworks/${updatedList[index].id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auctionEndTime: newAuctionEndTime,
                }),
            });
            if (response.ok) {
                setlist(updatedList);
                setEditingIndex(null);
                setNewAuctionEndTime('');
            } else {
                console.error('Error saving auction time:', response.status);
            }
        } catch (error) {
            console.error('Error saving auction time:', error);
        }
    };

    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (loading) {
        return <p>Loading artworks...</p>;
    }

    return (
        <>
            <div className="p-10 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] h-fit">
                <h1 className="text-2xl font-bold text-[#D1A58F] mb-10">My Artworks</h1>

                <div className="relative overflow-x-auto shadow-lg sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-md text-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 dark:bg-gray-800">Status</th>
                                <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Title</th>
                                <th scope="col" className="px-6 py-3 w-50">Bidding Winner</th>
                                <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Category</th>
                                <th scope="col" className="px-6 py-3">Initial Price</th>
                                <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Auction Start Time</th>
                                <th scope="col" className="px-6 py-3">Auction End Time</th> 
                                <th scope="col" className="px-6 py-3 bg-gray-100 dark:bg-gray-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-black p-20 text-center font-semibold text-md">No Artworks</td>
                                </tr>
                            ) : (
                                list.map((current, index) => {
                                    const auctionEndDate = new Date(current.auctionEndTime);
                                    const hasAuctionEnded = auctionEndDate < todayDateOnly;

                                    return (
                                        <tr className="border-b border-gray-200 dark:border-gray-700" key={index}>
                                            <td className="px-6 py-4 dark:bg-gray-800">{current.status || 'Pending'}</td> 
                                            <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800">{current.title}</td>
                                            <td className="px-6 py-4">
                                                {hasAuctionEnded ? biddingWinner || 'Auction ended. Winner not announced yet.' : 'The winner will be announced after the auction ends.'}
                                            </td>
                                            <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800">{current.category}</td>
                                            <td className="px-6 py-4">{current.initialPrice}</td>
                                            <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800">{current.auctionStartTime}</td>
                                            <td className="px-6 py-4">
                                                {editingIndex === index ? (
                                                    <input type="date" value={newAuctionEndTime} onChange={(e) => setNewAuctionEndTime(e.target.value)} className="border rounded px-2 py-1"/>
                                                ) : (
                                                    current.auctionEndTime
                                                )}
                                            </td>
                                            <td className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-center">
                                                <button className="p-3 bg-[#0a115f] mr-2 text-white rounded-lg hover:bg-blue-900 cursor-pointer duration-300" onClick={() => handleDelete(index)}>
                                                    Delete
                                                </button>
                                                {hasAuctionEnded ? (
                                                    editingIndex === index ? (
                                                        <button className="mt-2 p-3 bg-[#D1A58F] text-white rounded-lg hover:bg-[#c0927b] duration-300 cursor-pointer" onClick={() => handleSaveAuctionTime(index)}>
                                                            Save
                                                        </button>
                                                    ) : (
                                                        <button className="mt-2 p-3 bg-[#D1A58F] text-white rounded-lg hover:bg-[#c0927b] duration-300 cursor-pointer" onClick={() => { setEditingIndex(index); setNewAuctionEndTime(current.auctionEndTime); }}>
                                                            Extend Auction Time
                                                        </button>
                                                    )
                                                ) : (
                                                    <Link to={'/ArtistDashboard/EditArtwork'} state={{ artwork: current, index }} className="p-3 bg-[#D1A58F] text-white rounded-lg hover:bg-[#c0927b] duration-300 cursor-pointer">
                                                        Edit
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
