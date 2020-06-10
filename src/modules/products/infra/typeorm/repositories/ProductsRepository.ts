import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const foundProducts = await this.ormRepository.findByIds(products);

    return foundProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsIds = products.map(
      product => ({ id: product.id } as IFindProducts),
    );

    let foundProducts = await this.findAllById(productsIds);

    foundProducts = foundProducts.map((product, product_index) => {
      const reduceStockAmount = products[product_index].quantity;

      const quantity = product.quantity - reduceStockAmount;

      const updatedProduct = { ...product, quantity } as Product;

      return updatedProduct;
    });

    foundProducts = await this.ormRepository.save(foundProducts);

    return foundProducts;
  }
}

export default ProductsRepository;
