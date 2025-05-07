import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Product } from '@/types/types'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

interface QuickViewProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export default function QuickView({ isOpen, onClose, product }: QuickViewProps) {
  const { addItem, items } = useCart()

  if (!product) return null

  const isInCart = items.some(item => item.id === product.id)
  const isDisabled = product.quantity === 1 && isInCart

  const handleAddToCart = () => {
    if (isDisabled) {
      toast.error('This item is already in your cart')
      return
    }
    
    addItem(product)
    toast.success('Added to cart')
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-[90%] sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  {/* Product Image */}
                  <div className="relative w-full sm:w-1/2 aspect-square mb-4 sm:mb-0 sm:mr-6">
                    <Image
                      src={product.image_url || '/placeholder.png'}
                      alt={product.name}
                      className="rounded-lg object-cover"
                      fill
                    />
                  </div>

                  {/* Product Details */}
                  <div className="w-full sm:w-1/2">
                    <Link 
                      href={product.slug === 'custom-coaster' || product.is_custom ? '/design-my-coaster' : `/product/${product.id}`}
                      className="inline-block group"
                      onClick={onClose}
                    >
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                        {product.name}
                      </Dialog.Title>
                    </Link>

                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {product.size && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Size</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{product.size}</p>
                        </div>
                      )}
                      {product.color && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Color</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{product.color}</p>
                        </div>
                      )}
                      {product.gender && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Gender</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {product.gender}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        £{product.cost.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="button"
                        className={`w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                          isDisabled 
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-hover-primary'
                        }`}
                        onClick={handleAddToCart}
                        disabled={isDisabled}
                      >
                        {isDisabled ? 'Already in Cart' : 'Add to Cart'}
                      </button>
                      <Link
                        href={product.slug === 'custom-coaster' || product.is_custom ? '/design-my-coaster' : `/product/${product.id}`}
                        className="w-full text-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        onClick={onClose}
                      >
                        View Full Details
                      </Link>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 