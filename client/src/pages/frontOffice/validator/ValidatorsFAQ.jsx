/* This example requires Tailwind CSS v2.0+ */
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'

const faqs = [
    {
        question: "I was supposed to have events associated, what's happening?",
        answer: "An NFT or a Non-Fungible Token is a token on the blockchain that represents a digital asset or a real-world association. These assets are non-fungible, that means they are unique by a token id that represents unequivocally in all world the token. We can have NFT’s for music, art, videogames, and tickets of course. They can be sell and bought in a Ethereum based blockchain, and they came to stay!",
    },
    {
        question: "I can't open the camera to validate, what's the problem?",
        answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum nemo voluptatibus, corporis vitae harum voluptates consequatur? Quasi ab dolore reprehenderit veritatis vitae, eaque a quos sequi fuga dolorem deserunt repellat? Ab nobis provident voluptate veniam, debitis a nulla laborum aut aliquam tempore in, ratione numquam reprehenderit. Dolorum voluptatum laudantium eos qui harum enim porro laboriosam ab error. Facilis, voluptatem. Autem"
    },
    {
        question: "Can I change the speed of ticket validation?",
        answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum nemo voluptatibus, corporis vitae harum voluptates consequatur? Quasi ab dolore reprehenderit veritatis vitae, eaque a quos sequi fuga dolorem deserunt repellat? Ab nobis provident voluptate veniam, debitis a nulla laborum aut aliquam tempore in, ratione numquam reprehenderit. Dolorum voluptatum laudantium eos qui harum enim porro laboriosam ab error. Facilis, voluptatem. Autem"
    },
]
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ValidatorsFAQ() {
    return (
        <div>
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
                <div className="lg:grid lg:grid-cols-3 lg:gap-24">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Frequently asked questions</h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Can’t find the answer you’re looking for? Reach out to our{' '}
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                customer support
                            </a>{' '}
                            team.
                        </p>
                    </div>
                    <div className="mt-12 lg:mt-0 lg:col-span-2">
                        <dl className="mt-6 space-y-6 divide-y divide-gray-200">
                            {faqs.map((faq) => (
                                <Disclosure as="div" key={faq.question} className="pt-6">
                                    {({ open }) => (
                                        <>
                                            <dt className="text-lg">
                                                <Disclosure.Button className="text-left w-full flex justify-between items-start">
                                                    <span className="font-medium text-gray-900 dark:text-gray-300">{faq.question}</span>
                                                    <span className="ml-6 h-7 flex items-center text-gray-600 dark:text-gray-100">
                                                        <ChevronDownIcon
                                                            className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-6 w-6 transform')}
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                </Disclosure.Button>
                                            </dt>
                                            <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                                <p className="text-base text-gray-500 dark:text-gray-400">{faq.answer}</p>
                                            </Disclosure.Panel>
                                        </>
                                    )}
                                </Disclosure>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
