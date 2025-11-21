import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@mui/material';
import { MyContext } from '../../App';
import { fetchDataFromApi, editData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';

const SiteSettings = () => {
    const [popularProductsSubtitle, setPopularProductsSubtitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const context = useContext(MyContext);

    useEffect(() => {
        fetchDataFromApi(`/api/siteSettings`).then((res) => {
            if (res?.error === false && res?.data) {
                setPopularProductsSubtitle(res?.data?.popularProductsSubtitle || '');
            }
            setIsFetching(false);
        }).catch(() => {
            setIsFetching(false);
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!popularProductsSubtitle.trim()) {
            context.alertBox("error", "Please enter the subtitle text");
            return false;
        }

        setIsLoading(true);

        editData(`/api/siteSettings/update`, {
            popularProductsSubtitle: popularProductsSubtitle.trim()
        }).then((res) => {
            if (res?.data?.error === false) {
                context.alertBox("success", res?.data?.message || "Site settings updated successfully");
            } else {
                context.alertBox("error", res?.data?.message || "Failed to update settings");
            }
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }).catch(() => {
            context.alertBox("error", "Failed to update settings");
            setIsLoading(false);
        });
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-3">
                <h2 className="text-[18px] font-[600]">
                    Site Settings
                </h2>
            </div>

            <form className='form py-1 md:p-3 md:py-1' onSubmit={handleSubmit}>
                <div className="card my-4 pt-5 pb-5 shadow-md sm:rounded-lg bg-white w-[100%] sm:w-[100%] lg:w-[65%] p-5">
                    <div className='col mb-4'>
                        <h3 className='text-[14px] font-[500] mb-1 text-black'>Popular Products Subtitle</h3>
                        <p className='text-[12px] text-gray-500 mb-2'>This text appears below "Popular Products" heading on the home page.</p>
                        <input
                            type="text"
                            className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            name="popularProductsSubtitle"
                            value={popularProductsSubtitle}
                            onChange={(e) => setPopularProductsSubtitle(e.target.value)}
                            placeholder="Do not miss the current offers until the end of March."
                        />
                    </div>

                    <br />

                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                        {
                            isLoading === true ? (
                                <CircularProgress color="inherit" size={20} />
                            ) : (
                                "Save Settings"
                            )
                        }
                    </Button>
                </div>
            </form>
        </>
    );
};

export default SiteSettings;

