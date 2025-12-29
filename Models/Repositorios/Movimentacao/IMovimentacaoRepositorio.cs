using Models.Entidades;

namespace Models.Repositorios.Movimentacao
{
    public interface IMovimentacaoRepositorio
    {
        Task CriarMovimentacaoAsync(Movimentacaos movimentacao);
        Task<List<Movimentacaos>> listarMovimentacaoesint(Guid id);
        Task<List<Movimentacaos>> ListarMovimentacoesPorMesAsync(Guid usuarioId, int ano, int mes);
        Task EditarMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId, EditarMovimentacaoDto dto);
        Task ExcluirMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId);
        Task<ResumoMovimentacaoDto> ResumoMovimentacaoAsync(Guid usuarioId, int mes, int ano);
    }
}