import { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import Intro from './components/intro';
import Layout from './components/layout';
import RadialProgress from './components/radial-progress';
import Download from './components/result';
import { initializeApp } from 'firebase/app';
import { getDatabase, runTransaction, onValue, ref } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    databaseURL: import.meta.env.VITE_DATABASE_URL,
};

initializeApp(firebaseConfig);

const BeautifyCounterSnapshotMessage = (total) => {
    if (total < 1000) return total;
    else if (total < 1000000) return `${(total / 1000).toFixed(1)}K+`;
    else return `${(total / 1000000).toFixed(1)}M+`;
};

const updateCounterTransaction = (addCounterValue) => {
    const dbRef = ref(getDatabase(), 'counter');
    runTransaction(dbRef, (counter) => {
        if (counter) {
            counter.total += addCounterValue;
        }
        return counter;
    });
};

const ImageForm = () => {
    const maxSizeRef = useRef(null);
    const maxWidthRef = useRef(null);
    const imageRef = useRef(null);
    const [result, setResult] = useState([]);
    const handleAddResult = (result) => {
        setResult((prev) => [...prev, result]);
    };
    const [status, setStatus] = useState('Idle');
    const [buttonText, setButtonText] = useState('Compress');
    const [totalTask, setTotalTask] = useState(0);
    const [sectionProgess, setSectionProgess] = useState(0);
    const [completedTaskCounter, setCompletedTaskCounter] = useState(0);
    const [completedBarProgess, setCompletedBarProgress] = useState(0);
    const [counterSnapshot, setCounterSnapshot] = useState(0);

    /*
        totalTasks = n
        sectionProgress = 100 / total_task = y
        completeRadialTask = 1 * y = z (Setiap task z%)
    */

    useEffect(() => {
        maxSizeRef.current.value = 1;
        maxWidthRef.current.value = 1920;

        const dbRef = ref(getDatabase(), 'counter/total');
        onValue(dbRef, (snapshot) => {
            setCounterSnapshot(snapshot.val());
        });
    }, []);

    useEffect(() => {
        setCompletedBarProgress(completedTaskCounter * sectionProgess);
    }, [completedTaskCounter]);

    async function handleImageUpload(e) {
        e.preventDefault();

        setButtonText('Compressing...');
        setResult([]);

        let maxSize = maxSizeRef.current.value ? maxSizeRef.current.value : 1;
        maxSize = maxSize.toString().replace(',', '.');

        const options = {
            maxSizeMB: maxSize,
            maxWidthOrHeight: maxWidthRef.current.value
                ? maxWidthRef.current.value
                : 1920,
            useWebWorker: true,
        };

        const images = imageRef.current.files;
        const imagesLength = images.length;
        setTotalTask(imagesLength);
        setSectionProgess(100 / images.length);

        for (let i = 0; i < imagesLength; i++) {
            const imageFile = images[i];

            const prevSize = imageFile.size / 1024 / 1024;
            const compressedFile = await imageCompression(imageFile, options);
            const newSize = compressedFile.size / 1024 / 1024;
            const extension = compressedFile.name.split('.').pop();

            const result = {
                total_file: totalTask,
                name: `${i + 1}.${extension}`,
                prev_size: prevSize.toFixed(2), // MB
                new_size: newSize.toFixed(2), // MB
                img: URL.createObjectURL(compressedFile),
            };

            handleAddResult(result);
            setCompletedTaskCounter((prev) => prev + 1);
        }

        updateCounterTransaction(imagesLength);

        // https://github.com/firebase/snippets-web/blob/36740fb2c39383621c0c0a948236e9eab8a71516/database-next/read-and-write.js#L42
        // console.log('banyak data di server = ' + data);
        // console.log('data baru = ' + counter);
        // const total = data + counter;
        // console.log('total = ' + total);
        // set(ref(getDatabase(), 'counter', total));

        setButtonText('Done');
        setStatus('Done');
        setTotalTask(0);
        setSectionProgess(0);
        setCompletedTaskCounter(0);
        setCompletedBarProgress(0);
        setButtonText('Compress');
        imageRef.current.value = '';
    }

    return (
        <div className='flex flex-col justify-center items-center gap-y-12'>
            <span className='text-center text-xs md:text-md lg:text-lg'>
                Total gambar yang telah di compress =
                {` ` +
                    BeautifyCounterSnapshotMessage(counterSnapshot) +
                    ' buah'}
            </span>
            <form
                onSubmit={handleImageUpload}
                method='post'
                encType='multipart/form-data'
                className='w-full flex justify-center  gap-5 items-center flex-col'
            >
                <div className='form-control w-full max-w-xs'>
                    <label className='label'>
                        <span className='label-text text-accent'>
                            Maximum Size (mb){' '}
                            <h3 className='italic text-accent'>
                                ex ➜ 1 or 0.1 or 0.7, etc..
                            </h3>
                        </span>
                    </label>
                    <input
                        required={true}
                        type='number'
                        ref={maxSizeRef}
                        placeholder='ex ➜ 1'
                        className='input input-bordered bg-slate-900 input-primary text-accent w-full max-w-xs'
                    />
                </div>
                <div className='form-control w-full max-w-xs'>
                    <label className='label'>
                        <span className='label-text text-accent'>
                            Maximum Width/Height (px)
                            <h3 className='italic text-accent'>
                                ex ➜ 1280 or 1920 or 720, etc..
                            </h3>
                        </span>
                    </label>
                    <input
                        required={true}
                        type='number'
                        ref={maxWidthRef}
                        placeholder={`ex ➜ 1920`}
                        className='input input-bordered bg-slate-900 input-primary text-accent w-full max-w-xs'
                    />
                </div>
                <input
                    name='images'
                    type='file'
                    ref={imageRef}
                    required={true}
                    multiple={true}
                    accept='image/*'
                    className='file-input file-input-outline bg-slate-900 file-input-primary w-full max-w-xs'
                />

                {buttonText == 'Compress' && (
                    <button
                        type='submit'
                        className='btn btn-outline btn-primary'
                        onClick={handleImageUpload}
                    >
                        {buttonText}
                    </button>
                )}

                {buttonText == 'Compressing...' && (
                    <RadialProgress percent={completedBarProgess} />
                )}

                {buttonText == 'Done' && (
                    <button
                        type='button'
                        className='btn btn-outline btn-primary'
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Reset
                    </button>
                )}
            </form>

            {status === 'Done' && <Download result={result} />}
        </div>
    );
};

export default function App() {
    return (
        <Layout>
            <Intro />
            <ImageForm />
        </Layout>
    );
}
